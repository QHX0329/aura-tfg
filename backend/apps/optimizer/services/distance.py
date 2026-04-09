"""
Servicio de matriz de distancias y tiempos para el optimizador.

Usa OpenRouteService (ORS) para distancias reales por carretera con fallback
haversine cuando ORS no esta disponible o la clave API esta vacia.
"""

import math

import requests
import structlog
from django.conf import settings

logger = structlog.get_logger(__name__)

# Endpoint de la API ORS para matrices de distancias/tiempos
_ORS_MATRIX_URL = "https://api.openrouteservice.org/v2/matrix/driving-car"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calcula la distancia haversine en km entre dos puntos geograficos.

    Args:
        lat1: Latitud del primer punto.
        lng1: Longitud del primer punto.
        lat2: Latitud del segundo punto.
        lng2: Longitud del segundo punto.

    Returns:
        Distancia en kilometros.
    """
    earth_radius_km = 6371.0  # Radio de la Tierra en km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * earth_radius_km * math.asin(math.sqrt(a))


def _fallback_matrices(
    points: list[tuple[float, float]],
) -> tuple[list[list[float]], list[list[float]]]:
    """
    Calcula matrices de distancia y tiempo usando haversine (ST_Distance aproximado).

    Tiempo estimado asumiendo velocidad urbana media de 40 km/h.

    Args:
        points: Lista de tuplas (lat, lng).

    Returns:
        Tupla (distance_matrix_km, time_matrix_minutes).
    """
    n = len(points)
    distance_matrix: list[list[float]] = []
    time_matrix: list[list[float]] = []

    for i in range(n):
        dist_row: list[float] = []
        time_row: list[float] = []
        for j in range(n):
            if i == j:
                dist_row.append(0.0)
                time_row.append(0.0)
            else:
                lat1, lng1 = points[i]
                lat2, lng2 = points[j]
                dist_km = _haversine_km(lat1, lng1, lat2, lng2)
                time_min = dist_km / 40.0 * 60.0  # 40 km/h velocidad urbana media
                dist_row.append(dist_km)
                time_row.append(time_min)
        distance_matrix.append(dist_row)
        time_matrix.append(time_row)

    return distance_matrix, time_matrix


def get_distance_matrix(
    points: list[tuple[float, float]],
    ors_api_key: str | None = None,
) -> tuple[list[list[float]], list[list[float]]]:
    """
    Obtiene la matriz de distancias y tiempos entre todos los puntos dados.

    Intenta usar OpenRouteService (ORS) para distancias reales por carretera.
    Si la clave ORS_API_KEY esta vacia o la llamada falla, usa calculo haversine
    como fallback.

    Args:
        points: Lista de tuplas (lat, lng) representando los puntos a conectar.
                El primer punto se asume como la ubicacion del usuario.
        ors_api_key: Clave de API de OpenRouteService. Si es None, lee
                     ORS_API_KEY de settings. Si esta vacia, se usa fallback.

    Returns:
        Tupla (distance_matrix_km, time_matrix_minutes) donde cada elemento
        [i][j] representa la distancia/tiempo de i a j.
    """
    api_key = ors_api_key if ors_api_key is not None else settings.ORS_API_KEY

    if not api_key:
        logger.info(
            "ors_api_key_empty_using_haversine_fallback",
            n_points=len(points),
        )
        return _fallback_matrices(points)

    # ORS espera [[lng, lat], ...] igual que Graphhopper
    ors_points = [[lng, lat] for lat, lng in points]

    payload = {
        "locations": ors_points,
        "metrics": ["distance", "duration"],
        "units": "km",
    }

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            _ORS_MATRIX_URL,
            json=payload,
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        # distances ya vienen en km (units="km"), NO dividir por 1000
        distance_matrix = data["distances"]
        # durations vienen en segundos → convertir a minutos
        time_matrix = [[sec / 60.0 for sec in row] for row in data["durations"]]

        logger.info("ors_matrix_success", n_points=len(points))
        return distance_matrix, time_matrix

    except (requests.ConnectionError, requests.Timeout) as exc:
        logger.warning(
            "ors_unavailable_fallback_haversine",
            error=str(exc),
            n_points=len(points),
        )
        return _fallback_matrices(points)
    except requests.HTTPError as exc:
        logger.warning(
            "ors_http_error_fallback_haversine",
            status_code=exc.response.status_code if exc.response else None,
            error=str(exc),
            n_points=len(points),
        )
        return _fallback_matrices(points)
    except Exception as exc:
        logger.warning(
            "ors_unexpected_error_fallback_haversine",
            error=str(exc),
            n_points=len(points),
        )
        return _fallback_matrices(points)
