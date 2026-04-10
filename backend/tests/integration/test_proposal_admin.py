"""
Tests de integracion para los endpoints admin de propuestas de productos.

Cubre:
- POST /api/v1/products/proposals/admin/{id}/approve/
- POST /api/v1/products/proposals/admin/{id}/reject/
"""

import pytest
from django.contrib.gis.geos import Point
from rest_framework import status

pytestmark = pytest.mark.django_db


def _approve_url(proposal_id: int) -> str:
    return f"/api/v1/products/proposals/admin/{proposal_id}/approve/"


def _reject_url(proposal_id: int) -> str:
    return f"/api/v1/products/proposals/admin/{proposal_id}/reject/"


@pytest.fixture
def category():
    from apps.products.models import Category

    return Category.objects.create(name="Cat Test Proposals", slug="cat-test-proposals")


@pytest.fixture
def store():
    from apps.stores.models import Store

    return Store.objects.create(
        name="Tienda Test Proposals",
        address="Calle Test 1",
        location=Point(-5.9845, 37.3891, srid=4326),
    )


@pytest.fixture
def pending_proposal_with_price(consumer_user, category, store):
    from apps.products.models import ProductProposal

    return ProductProposal.objects.create(
        proposed_by=consumer_user,
        name="Leche Entera Proposal",
        brand="Puleva",
        barcode="8411600301014",
        category=category,
        price="1.29",
        unit_price="1.29",
        store=store,
        status=ProductProposal.Status.PENDING,
    )


@pytest.fixture
def pending_proposal_without_price(consumer_user, category):
    from apps.products.models import ProductProposal

    return ProductProposal.objects.create(
        proposed_by=consumer_user,
        name="Producto Sin Precio",
        brand="Marca X",
        barcode="8411600301021",
        category=category,
        status=ProductProposal.Status.PENDING,
    )


class TestProposalAdminApprove:
    """Tests para POST /api/v1/products/proposals/admin/{id}/approve/"""

    def test_approve_proposal_creates_product_and_price(
        self, admin_client, pending_proposal_with_price
    ):
        from apps.prices.models import Price
        from apps.products.models import Product, ProductProposal

        proposal = pending_proposal_with_price

        response = admin_client.post(_approve_url(proposal.id), {}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["success"] is True
        assert response.json()["data"]["proposal_id"] == proposal.id

        product = Product.objects.get(barcode="8411600301014")
        assert product.name == "Leche Entera Proposal"
        assert product.brand == "Puleva"

        price = Price.objects.get(product=product, store=proposal.store)
        assert str(price.price) == "1.29"
        assert price.source == Price.Source.CROWDSOURCING
        assert price.is_stale is False

        proposal.refresh_from_db()
        assert proposal.status == ProductProposal.Status.APPROVED

    def test_approve_proposal_idempotent_barcode(self, admin_client, pending_proposal_with_price):
        from apps.prices.models import Price
        from apps.products.models import Product, ProductProposal
        from tests.factories import ProductFactory

        proposal = pending_proposal_with_price
        existing_product = ProductFactory(
            barcode=proposal.barcode,
            name="Existing Product",
            normalized_name="existing product",
        )

        response = admin_client.post(_approve_url(proposal.id), {}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["success"] is True
        assert response.json()["data"]["product"]["id"] == existing_product.id
        assert Product.objects.filter(barcode=proposal.barcode).count() == 1
        assert Price.objects.filter(
            product=existing_product,
            store=proposal.store,
            source=Price.Source.CROWDSOURCING,
        ).exists()

        proposal.refresh_from_db()
        assert proposal.status == ProductProposal.Status.APPROVED

    def test_approve_proposal_without_price_no_price_created(
        self, admin_client, pending_proposal_without_price
    ):
        from apps.prices.models import Price
        from apps.products.models import Product, ProductProposal

        proposal = pending_proposal_without_price

        response = admin_client.post(_approve_url(proposal.id), {}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["success"] is True

        product = Product.objects.get(barcode="8411600301021")
        assert product.name == "Producto Sin Precio"
        assert Price.objects.filter(product=product).count() == 0

        proposal.refresh_from_db()
        assert proposal.status == ProductProposal.Status.APPROVED

    def test_approve_already_approved_returns_400(self, admin_client, pending_proposal_with_price):
        proposal = pending_proposal_with_price

        first_response = admin_client.post(_approve_url(proposal.id), {}, format="json")
        assert first_response.status_code == status.HTTP_200_OK

        # `status=all` evita el filtro por pendientes y hace que la validacion de estado
        # del action se ejecute sobre la propuesta ya aprobada.
        second_response = admin_client.post(
            f"{_approve_url(proposal.id)}?status=all",
            {},
            format="json",
        )

        assert second_response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Solo se pueden aprobar propuestas pendientes" in second_response.json()["detail"]

    def test_non_admin_cannot_approve(self, authenticated_client, pending_proposal_with_price):
        proposal = pending_proposal_with_price

        response = authenticated_client.post(_approve_url(proposal.id), {}, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestProposalAdminReject:
    """Tests para POST /api/v1/products/proposals/admin/{id}/reject/"""

    def test_reject_proposal_with_reason(self, admin_client, pending_proposal_with_price):
        from apps.products.models import ProductProposal

        proposal = pending_proposal_with_price

        response = admin_client.post(
            _reject_url(proposal.id),
            {"reason": "Duplicado"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["success"] is True
        assert response.json()["data"]["proposal_id"] == proposal.id
        assert response.json()["data"]["status"] == "rejected"

        proposal.refresh_from_db()
        assert proposal.status == ProductProposal.Status.REJECTED
        assert "RECHAZADO" in proposal.notes
        assert "Duplicado" in proposal.notes
