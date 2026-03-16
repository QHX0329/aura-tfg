"""URLs del módulo de precios."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CrowdsourcePriceView,
    ListTotalView,
    PriceAlertViewSet,
    PriceCompareView,
    PriceHistoryView,
)

router = DefaultRouter()
router.register(r"alerts", PriceAlertViewSet, basename="price-alert")

urlpatterns = [
    path("compare/", PriceCompareView.as_view(), name="price-compare"),
    path("list-total/", ListTotalView.as_view(), name="price-list-total"),
    path("crowdsource/", CrowdsourcePriceView.as_view(), name="price-crowdsource"),
    path("<int:product_id>/history/", PriceHistoryView.as_view(), name="price-history"),
    path("", include(router.urls)),
]
