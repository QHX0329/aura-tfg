"""Vistas del módulo de tiendas con búsqueda geoespacial."""

import requests as http_requests
from django.conf import settings
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.core.cache import cache
from django.http import Http404
from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.exceptions import BargainAPIException
from apps.core.responses import success_response

from .models import Store, UserFavoriteStore
from .serializers import StoreDetailSerializer, StoreListSerializer


class StoreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de tiendas.

    Endpoints:
        GET /api/v1/stores/?lat=<lat>&lng=<lng>[&radius_km=<km>]  — búsqueda geoespacial
        GET /api/v1/stores/?favorites=true                         — favoritos del usuario (auth)
        GET /api/v1/stores/<id>/                                   — detalle por PK
        POST /api/v1/stores/<id>/favorite/                         — alternar favorito
    """

    permission_classes = []  # list/retrieve son públicos; favorite define el suyo propio

    @extend_schema(
        summary="Listar tiendas",
        description=(
            "Devuelve tiendas según el modo de consulta:\n\n"
            "**Modo favoritos** (`?favorites=true`, requiere autenticación):\n"
            "Devuelve todas las tiendas marcadas como favoritas por el usuario "
            "autenticado, ordenadas por nombre. No requiere `lat`/`lng`.\n\n"
            "**Modo geoespacial** (por defecto):\n"
            "Devuelve las tiendas dentro del radio especificado, ordenadas por "
            "distancia al usuario. Requiere `lat` y `lng`."
        ),
        parameters=[
            OpenApiParameter(
                "favorites",
                bool,
                required=False,
                description=(
                    "Si `true`, devuelve las tiendas favoritas del usuario autenticado "
                    "sin necesitar coordenadas. Incompatible con `lat`/`lng`."
                ),
            ),
            OpenApiParameter(
                "lat",
                float,
                required=False,
                description="Latitud del usuario (WGS-84). Requerido en modo geoespacial.",
            ),
            OpenApiParameter(
                "lng",
                float,
                required=False,
                description="Longitud del usuario (WGS-84). Requerido en modo geoespacial.",
            ),
            OpenApiParameter(
                "radius_km",
                float,
                required=False,
                description="Radio de búsqueda en km (defecto: radio del perfil del usuario o 10 km). Solo aplica en modo geoespacial.",
            ),
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        """Lista tiendas en modo favoritos o geoespacial según los parámetros recibidos."""
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        """
        Devuelve el queryset adecuado según la acción:

        - retrieve / favorite: lookup directo por PK, sin filtro geoespacial.
        - list?favorites=true: tiendas favoritas del usuario autenticado, sin geo.
        - list: tiendas dentro del radio especificado, ordenadas por distancia.
          Requiere parámetros lat y lng en la query string.

        Raises:
            BargainAPIException: Si faltan lat o lng en la acción list.
        """
        # Para detail/retrieve no aplicamos filtro geoespacial — sólo buscamos por PK.
        if self.action in ("retrieve", "favorite", "places_detail"):
            return Store.objects.filter(is_active=True).select_related("chain")

        request: Request = self.request

        # Favoritos: no requieren coordenadas
        if request.query_params.get("favorites") == "true" and request.user.is_authenticated:
            return (
                Store.objects.filter(
                    is_active=True,
                    favorited_by__user=request.user,
                )
                .select_related("chain")
                .order_by("name")
            )

        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")

        if not lat or not lng:
            raise BargainAPIException(
                detail="Se requieren los parámetros lat y lng.",
                code="MISSING_LOCATION",
            )

        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError as exc:
            raise BargainAPIException(
                detail="Los parámetros lat y lng deben ser números válidos.",
                code="INVALID_LOCATION",
            ) from exc

        # Radio: usa el parámetro de la request o el predeterminado del usuario
        try:
            radius_km = float(
                request.query_params.get("radius_km", request.user.max_search_radius_km)
            )
        except (ValueError, AttributeError):
            radius_km = 10.0

        # NOTA: Point() requiere longitud primero, luego latitud (SRID 4326)
        user_location = Point(lng, lat, srid=4326)

        return (
            Store.objects.filter(
                location__distance_lte=(user_location, D(km=radius_km)),
                is_active=True,
            )
            .annotate(distance=Distance("location", user_location))
            .order_by("distance")
            .select_related("chain")
        )

    def get_serializer_class(self):
        """Usa StoreDetailSerializer en retrieve, StoreListSerializer en list."""
        if self.action == "retrieve":
            return StoreDetailSerializer
        return StoreListSerializer

    @extend_schema(
        summary="Detalle de Places de Google",
        description=(
            "Devuelve datos enriquecidos de la tienda desde Google Places API "
            "(horario, valoración, número de reseñas, URL web), con caché Redis de 24h. "
            "Devuelve `{}` si la tienda no tiene `google_place_id`, si falta la API key, "
            "o si Google Places falla (silent fail)."
        ),
        responses={
            200: inline_serializer(
                "PlacesDetailResponse",
                fields={
                    "opening_hours": drf_serializers.JSONField(allow_null=True),
                    "rating": drf_serializers.FloatField(allow_null=True),
                    "user_rating_count": drf_serializers.IntegerField(allow_null=True),
                    "website_url": drf_serializers.CharField(allow_null=True),
                },
            )
        },
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="places-detail",
        permission_classes=[IsAuthenticated],
    )
    def places_detail(self, request: Request, pk: str | None = None) -> Response:
        """
        Devuelve datos enriquecidos de la tienda desde Google Places API con caché 24h.

        GET /api/v1/stores/<id>/places-detail/
        Returns:
            {"opening_hours": ..., "rating": ..., "user_rating_count": ..., "website_url": ...}
            o {} si no hay google_place_id, api key o falla Google.
        """
        cache_key = f"places_detail:{pk}"
        cached = cache.get(cache_key)
        if cached is not None:
            return success_response(cached)

        try:
            store = Store.objects.get(pk=pk, is_active=True)
        except Store.DoesNotExist as exc:
            raise Http404 from exc

        if not store.google_place_id:
            return success_response({})

        api_key = settings.GOOGLE_PLACES_API_KEY
        if not api_key:
            return success_response({})

        try:
            response = http_requests.get(
                f"https://places.googleapis.com/v1/places/{store.google_place_id}",
                headers={
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": "currentOpeningHours,rating,userRatingCount,websiteUri",
                },
                timeout=5,
            )
            response.raise_for_status()
            data = response.json()
        except Exception:
            return success_response({})

        normalized = {
            "opening_hours": data.get("currentOpeningHours"),
            "rating": data.get("rating"),
            "user_rating_count": data.get("userRatingCount"),
            "website_url": data.get("websiteUri"),
        }
        cache.set(cache_key, normalized, timeout=60 * 60 * 24)
        return success_response(normalized)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                "FavoriteResponse", fields={"is_favorite": drf_serializers.BooleanField()}
            )
        },
        description="Alterna el estado de favorito de una tienda. Devuelve `is_favorite: true` si se añadió, `false` si se eliminó.",
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="favorite",
        permission_classes=[IsAuthenticated],
    )
    def favorite(self, request: Request, pk: str | None = None) -> Response:
        """
        Alterna el estado de favorito de una tienda para el usuario autenticado.

        POST /api/v1/stores/<id>/favorite/
        Returns:
            {"is_favorite": true} si se añadió, {"is_favorite": false} si se eliminó.
        """
        # Lookup directamente por pk sin requerir lat/lng (el favorito no necesita distancia)
        try:
            store = Store.objects.get(pk=pk)
        except Store.DoesNotExist as exc:
            raise Http404 from exc
        self.check_object_permissions(request, store)
        favorite_qs = UserFavoriteStore.objects.filter(user=request.user, store=store)

        if favorite_qs.exists():
            favorite_qs.delete()
            return success_response({"is_favorite": False})
        else:
            UserFavoriteStore.objects.create(user=request.user, store=store)
            return success_response({"is_favorite": True})
