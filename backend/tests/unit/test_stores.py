"""Tests unitarios del módulo de tiendas."""

from unittest.mock import MagicMock, call, patch

import pytest
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance

from apps.stores.models import Store, StoreChain
from apps.stores.serializers import StoreListSerializer


@pytest.fixture
def mercadona_chain(db) -> StoreChain:
    return StoreChain.objects.create(name="Mercadona", slug="mercadona")


@pytest.fixture
def store_with_chain(db, seville_point, mercadona_chain) -> Store:
    return Store.objects.create(
        name="Mercadona Triana",
        chain=mercadona_chain,
        address="Calle Betis 1, Sevilla",
        location=seville_point,
        is_local_business=False,
        is_active=True,
    )


@pytest.fixture
def local_store(db, seville_point) -> Store:
    return Store.objects.create(
        name="Frutería Carmen",
        chain=None,
        address="Calle Feria 22, Sevilla",
        location=seville_point,
        is_local_business=True,
        is_active=True,
    )


class TestStoreListSerializer:
    """Tests para StoreListSerializer."""

    def test_includes_geojson_location_field(self, store_with_chain):
        """El serializer debe incluir location como GeoJSON [lng, lat]."""
        store = store_with_chain
        store.distance = Distance(m=500)

        serializer = StoreListSerializer(store)
        data = serializer.data

        assert "location" in data
        assert data["location"]["type"] == "Point"
        assert data["location"]["coordinates"] == [store.location.x, store.location.y]

    def test_includes_is_local_business_field(self, local_store):
        """El serializer debe incluir is_local_business."""
        store = local_store
        # Annotate distance manually
        store.distance = Distance(m=500)
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert "is_local_business" in data
        assert data["is_local_business"] is True

    def test_includes_chain_name_when_chain_exists(self, store_with_chain, mercadona_chain):
        """El serializer debe incluir el nombre de la cadena cuando existe."""
        store = store_with_chain
        store.distance = Distance(m=1000)
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert data["chain"] is not None
        assert data["chain"]["name"] == "Mercadona"
        assert data["chain"]["id"] == mercadona_chain.id

    def test_chain_is_null_for_local_business(self, local_store):
        """El serializer debe devolver chain=null para comercios locales."""
        store = local_store
        store.distance = Distance(m=200)
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert data["chain"] is None

    def test_distance_km_converts_meters_to_km(self, store_with_chain):
        """distance_km debe convertir metros a kilómetros correctamente."""
        store = store_with_chain
        # 2500 metros = 2.5 km
        store.distance = Distance(m=2500)
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert data["distance_km"] == 2.5

    def test_distance_km_rounds_to_2_decimals(self, store_with_chain):
        """distance_km debe redondear a 2 decimales."""
        store = store_with_chain
        # 1234.567 metros = 1.234567 km → 1.23
        store.distance = Distance(m=1234.567)
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert data["distance_km"] == 1.23

    def test_distance_km_is_none_when_no_annotation(self, store_with_chain):
        """distance_km debe devolver None si no hay anotación de distancia."""
        store = store_with_chain
        # Sin atributo distance anotado
        serializer = StoreListSerializer(store)
        data = serializer.data
        assert data["distance_km"] is None


@pytest.fixture
def store_with_google_place_id(db, seville_point) -> Store:
    """Tienda con google_place_id configurado."""
    chain = StoreChain.objects.create(name="Mercadona Cache Test", slug="mercadona-cache-test")
    return Store.objects.create(
        name="Mercadona Cache",
        chain=chain,
        address="Calle Cache 1, Sevilla",
        location=seville_point,
        is_local_business=False,
        is_active=True,
        google_place_id="ChIJcache123",
    )


class TestPlacesDetailCache:
    """Tests para el comportamiento de caché del endpoint places-detail."""

    PLACES_API_RESPONSE = {
        "currentOpeningHours": {"openNow": True},
        "rating": 4.2,
        "userRatingCount": 99,
        "websiteUri": "https://mercadona.es",
    }

    def test_places_detail_cache_hit(
        self, authenticated_client, store_with_google_place_id, settings
    ):
        """Segunda llamada al endpoint usa caché y no llama a Google API dos veces."""
        settings.GOOGLE_PLACES_API_KEY = "test-api-key"

        mock_response = MagicMock()
        mock_response.json.return_value = self.PLACES_API_RESPONSE
        mock_response.raise_for_status.return_value = None

        store_id = store_with_google_place_id.id

        with patch("apps.stores.views.http_requests.get", return_value=mock_response) as mock_get:
            # Primera llamada — llama a Google API
            response1 = authenticated_client.get(
                f"/api/v1/stores/{store_id}/places-detail/"
            )
            # Segunda llamada — debe usar caché
            response2 = authenticated_client.get(
                f"/api/v1/stores/{store_id}/places-detail/"
            )

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.data["data"]["rating"] == 4.2
        assert response2.data["data"]["rating"] == 4.2
        # Google API sólo debe llamarse una vez (la segunda respuesta viene del caché)
        mock_get.assert_called_once()
