"""
Tests de integracion para el endpoint de actualizacion masiva de precios.

Cubre POST /api/v1/business/prices/bulk-update/.
"""

import pytest
from django.contrib.gis.geos import Point
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


class TestBulkPriceUpdate:
    """Tests para la actualizacion masiva de precios del portal business."""

    def test_bulk_update_valid_rows(
        self,
        api_client,
        verified_business_user,
        business_store,
        product_a,
        product_b,
    ):
        """Dos filas validas deben crear dos precios y no devolver errores."""
        from apps.prices.models import Price

        api_client.force_authenticate(user=verified_business_user)
        payload = [
            {"product": product_a.id, "store": business_store.id, "price": "2.50"},
            {"product": product_b.id, "store": business_store.id, "price": "3.10"},
        ]

        response = api_client.post(
            "/api/v1/business/prices/bulk-update/",
            data=payload,
            format="json",
        )

        assert response.status_code == 200
        data = response.data["data"]
        assert data["created"] == 2
        assert data["updated"] == 0
        assert data["errors"] == []
        assert (
            Price.objects.filter(store=business_store, source=Price.Source.BUSINESS).count() == 2
        )

    def test_bulk_update_invalid_product_id(
        self,
        api_client,
        verified_business_user,
        business_store,
        product_a,
    ):
        """Una fila invalida no bloquea las filas correctas del mismo lote."""
        from apps.prices.models import Price

        api_client.force_authenticate(user=verified_business_user)
        payload = [
            {"product": product_a.id, "store": business_store.id, "price": "2.50"},
            {"product": 9_999_999, "store": business_store.id, "price": "1.00"},
        ]

        response = api_client.post(
            "/api/v1/business/prices/bulk-update/",
            data=payload,
            format="json",
        )

        assert response.status_code == 200
        data = response.data["data"]
        assert data["created"] == 1
        assert data["updated"] == 0
        assert len(data["errors"]) == 1
        assert data["errors"][0]["index"] == 1
        assert "product" in data["errors"][0]["errors"]
        assert (
            Price.objects.filter(store=business_store, source=Price.Source.BUSINESS).count() == 1
        )

    def test_bulk_update_store_not_owned(
        self,
        api_client,
        verified_business_user,
        other_store,
        product_a,
    ):
        """Una tienda de otro negocio debe devolverse como error por fila."""
        from apps.prices.models import Price

        api_client.force_authenticate(user=verified_business_user)
        payload = [
            {"product": product_a.id, "store": other_store.id, "price": "1.50"},
        ]

        response = api_client.post(
            "/api/v1/business/prices/bulk-update/",
            data=payload,
            format="json",
        )

        assert response.status_code == 200
        data = response.data["data"]
        assert data["created"] == 0
        assert data["updated"] == 0
        assert len(data["errors"]) == 1
        assert data["errors"][0]["index"] == 0
        assert data["errors"][0]["errors"]["store"] == "Tienda no pertenece a tu negocio."
        assert Price.objects.filter(store=other_store, source=Price.Source.BUSINESS).count() == 0

    def test_bulk_update_missing_required_field(
        self,
        api_client,
        verified_business_user,
        business_store,
        product_a,
    ):
        """La ausencia de price debe aparecer como error de validacion del item."""
        from apps.prices.models import Price

        api_client.force_authenticate(user=verified_business_user)
        payload = [
            {"product": product_a.id, "store": business_store.id},
        ]

        response = api_client.post(
            "/api/v1/business/prices/bulk-update/",
            data=payload,
            format="json",
        )

        assert response.status_code == 200
        data = response.data["data"]
        assert data["created"] == 0
        assert data["updated"] == 0
        assert len(data["errors"]) == 1
        assert data["errors"][0]["index"] == 0
        assert "price" in data["errors"][0]["errors"]
        assert (
            Price.objects.filter(store=business_store, source=Price.Source.BUSINESS).count() == 0
        )

    def test_bulk_update_requires_verified_profile(
        self,
        api_client,
        unverified_business_user,
        product_a,
    ):
        """Un perfil no verificado recibe 403 antes de procesar el lote."""
        api_client.force_authenticate(user=unverified_business_user)
        payload = [
            {"product": product_a.id, "store": 1, "price": "1.00"},
        ]

        response = api_client.post(
            "/api/v1/business/prices/bulk-update/",
            data=payload,
            format="json",
        )

        assert response.status_code == 403


# Fixtures locales para evitar interferencias con otros módulos de integracion.


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def verified_business_user(db):
    from apps.business.models import BusinessProfile
    from apps.users.models import User

    user = User.objects.create_user(
        username="bulk_verified_biz",
        email="bulk_verified_biz@test.com",
        password="pass1234",
        role=User.Role.BUSINESS,
    )
    BusinessProfile.objects.create(
        user=user,
        business_name="Negocio Bulk Verificado",
        tax_id="B11223344",
        address="Calle Bulk 1",
        is_verified=True,
    )
    return user


@pytest.fixture
def unverified_business_user(db):
    from apps.business.models import BusinessProfile
    from apps.users.models import User

    user = User.objects.create_user(
        username="bulk_unverified_biz",
        email="bulk_unverified_biz@test.com",
        password="pass1234",
        role=User.Role.BUSINESS,
    )
    BusinessProfile.objects.create(
        user=user,
        business_name="Negocio Bulk No Verificado",
        tax_id="B99887766",
        address="Calle Bulk 2",
        is_verified=False,
    )
    return user


@pytest.fixture
def business_store(db, verified_business_user):
    from apps.business.models import BusinessProfile
    from apps.stores.models import Store

    profile = BusinessProfile.objects.get(user=verified_business_user)
    return Store.objects.create(
        name="Tienda Bulk Propia",
        address="Calle Bulk Tienda 1",
        location=Point(-5.9845, 37.3891, srid=4326),
        is_local_business=True,
        business_profile=profile,
    )


@pytest.fixture
def other_store(db):
    """Tienda de otro negocio para validar la proteccion de ownership."""
    from apps.business.models import BusinessProfile
    from apps.stores.models import Store
    from apps.users.models import User

    other_user = User.objects.create_user(
        username="bulk_other_biz",
        email="bulk_other_biz@test.com",
        password="pass1234",
        role=User.Role.BUSINESS,
    )
    other_profile = BusinessProfile.objects.create(
        user=other_user,
        business_name="Negocio Bulk Ajeno",
        tax_id="C55667788",
        address="Calle Bulk 3",
        is_verified=True,
    )
    return Store.objects.create(
        name="Tienda Bulk Ajena",
        address="Calle Bulk Tienda 2",
        location=Point(-5.98, 37.39, srid=4326),
        business_profile=other_profile,
    )


@pytest.fixture
def product_a(db):
    from apps.products.models import Category, Product

    category, _ = Category.objects.get_or_create(name="Cat Bulk", slug="cat-bulk")
    return Product.objects.create(
        name="Producto Bulk A",
        normalized_name="producto bulk a",
        category=category,
        unit="ud",
    )


@pytest.fixture
def product_b(db):
    from apps.products.models import Category, Product

    category, _ = Category.objects.get_or_create(name="Cat Bulk", slug="cat-bulk")
    return Product.objects.create(
        name="Producto Bulk B",
        normalized_name="producto bulk b",
        category=category,
        unit="ud",
    )
