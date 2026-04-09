"""Tests unitarios para el cliente ORS de get_distance_matrix."""

from unittest.mock import Mock, patch

import pytest
import requests

from apps.optimizer.services.distance import get_distance_matrix

ORS_RESPONSE = {
    "distances": [[0.0, 5.2], [5.2, 0.0]],
    "durations": [[0.0, 1200.5], [1200.5, 0.0]],
}


def test_ors_matrix_success():
    """ORS response se parsea correctamente: km y minutos."""
    mock_resp = Mock()
    mock_resp.json.return_value = ORS_RESPONSE
    mock_resp.raise_for_status.return_value = None
    points = [(-5.99, 37.38), (-6.00, 37.39)]
    with patch("apps.optimizer.services.distance.requests.post", return_value=mock_resp):
        with patch("apps.optimizer.services.distance.settings") as mock_settings:
            mock_settings.ORS_API_KEY = "test-key"
            dist_km, time_min = get_distance_matrix(points)
    assert dist_km[0][1] == pytest.approx(5.2)
    assert time_min[0][1] == pytest.approx(1200.5 / 60)


def test_ors_fallback_on_connection_error():
    """ConnectionError al llamar ORS activa fallback haversine."""
    points = [(-5.99, 37.38), (-6.00, 37.39)]
    with patch(
        "apps.optimizer.services.distance.requests.post",
        side_effect=requests.ConnectionError,
    ):
        with patch("apps.optimizer.services.distance.settings") as mock_settings:
            mock_settings.ORS_API_KEY = "test-key"
            dist_km, time_min = get_distance_matrix(points)
    # Fallback haversine devuelve valores numericos
    assert len(dist_km) == 2
    assert len(dist_km[0]) == 2


def test_empty_ors_key_uses_fallback():
    """Sin ORS_API_KEY se usa fallback haversine directamente."""
    points = [(-5.99, 37.38), (-6.00, 37.39)]
    with patch("apps.optimizer.services.distance.settings") as mock_settings:
        mock_settings.ORS_API_KEY = ""
        dist_km, time_min = get_distance_matrix(points)
    assert len(dist_km) == 2
