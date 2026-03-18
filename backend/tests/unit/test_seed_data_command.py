"""Tests del comando de seed de usuarios."""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from apps.business.models import BusinessProfile, Promotion
from apps.core.management.commands.seed_data import SEED_PREFIX
from apps.notifications.models import Notification, UserPushToken
from apps.prices.models import Price, PriceAlert
from apps.products.models import Category, Product, ProductProposal
from apps.shopping_lists.models import (
    ListCollaborator,
    ListTemplate,
    ListTemplateItem,
    ShoppingList,
    ShoppingListItem,
)
from apps.stores.models import Store, StoreChain, UserFavoriteStore


@pytest.mark.django_db
def test_seed_data_creates_expected_users() -> None:
    """Crea admin y cantidades solicitadas por rol."""
    user_model = get_user_model()

    call_command("seed_data", consumers=2, businesses=1)

    seed_users = user_model.objects.filter(username__startswith=SEED_PREFIX)
    assert seed_users.count() == 4
    assert user_model.objects.filter(username="seed_admin", is_superuser=True).exists()
    assert user_model.objects.filter(username="seed_consumer_1", role="consumer").exists()
    assert user_model.objects.filter(username="seed_business_1", role="business").exists()


@pytest.mark.django_db
def test_seed_data_is_idempotent() -> None:
    """No duplica usuarios seed al ejecutar varias veces."""
    user_model = get_user_model()

    call_command("seed_data", consumers=3, businesses=2)
    first_count = user_model.objects.filter(username__startswith=SEED_PREFIX).count()

    call_command("seed_data", consumers=3, businesses=2)
    second_count = user_model.objects.filter(username__startswith=SEED_PREFIX).count()

    assert first_count == 6
    assert second_count == first_count


@pytest.mark.django_db
def test_seed_data_reset_recreates_only_seed_users() -> None:
    """Con --reset limpia seeds previos y no toca usuarios ajenos."""
    user_model = get_user_model()

    user_model.objects.create_user(
        username="manual_user",
        email="manual@example.com",
        password="manualpass123",
        role="consumer",
    )
    call_command("seed_data", consumers=2, businesses=1)

    call_command("seed_data", consumers=1, businesses=0, reset=True)

    assert user_model.objects.filter(username="manual_user").exists()
    assert user_model.objects.filter(username__startswith=SEED_PREFIX).count() == 2
    assert user_model.objects.filter(username="seed_admin").exists()
    assert user_model.objects.filter(username="seed_consumer_1").exists()
    assert not user_model.objects.filter(username="seed_consumer_2").exists()
    assert not user_model.objects.filter(username="seed_business_1").exists()


@pytest.mark.django_db
def test_seed_data_populates_all_backend_entities() -> None:
    """Crea registros seed para todas las entidades principales del backend."""
    call_command("seed_data", consumers=3, businesses=2, reset=True)

    assert Category.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert Product.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert ProductProposal.objects.filter(name__startswith=SEED_PREFIX).exists()

    assert StoreChain.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert Store.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert UserFavoriteStore.objects.filter(user__username__startswith=SEED_PREFIX).exists()

    assert Price.objects.filter(product__name__startswith=SEED_PREFIX).exists()
    assert PriceAlert.objects.filter(user__username__startswith=SEED_PREFIX).exists()

    assert ShoppingList.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert ShoppingListItem.objects.filter(shopping_list__name__startswith=SEED_PREFIX).exists()
    assert ListCollaborator.objects.filter(user__username__startswith=SEED_PREFIX).exists()
    assert ListTemplate.objects.filter(name__startswith=SEED_PREFIX).exists()
    assert ListTemplateItem.objects.filter(template__name__startswith=SEED_PREFIX).exists()

    assert BusinessProfile.objects.filter(business_name__startswith=SEED_PREFIX).exists()
    assert Promotion.objects.filter(title__startswith=SEED_PREFIX).exists()

    assert Notification.objects.filter(title__startswith=SEED_PREFIX).exists()
    assert UserPushToken.objects.filter(token__startswith=SEED_PREFIX).exists()
