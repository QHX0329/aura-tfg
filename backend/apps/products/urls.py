"""
Configuración de URLs para el dominio products.

Rutas:
- /api/v1/products/                         → ProductViewSet (lista y detalle)
- /api/v1/products/autocomplete/            → ProductViewSet.autocomplete
- /api/v1/products/categories/              → CategoryViewSet
- /api/v1/products/proposals/               → ProductProposalView (crear)
- /api/v1/products/proposals/admin/        → ProductProposalAdminViewSet (admin)
- /api/v1/products/proposals/admin/{id}/approve/  → aprobar propuesta
- /api/v1/products/proposals/admin/{id}/reject/   → rechazar propuesta
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import (
    CategoryViewSet,
    ProductProposalAdminViewSet,
    ProductProposalView,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"proposals/admin", ProductProposalAdminViewSet, basename="proposal-admin")
router.register(r"", ProductViewSet, basename="product")

urlpatterns = [
    path("proposals/", ProductProposalView.as_view(), name="product-proposal-create"),
    path("", include(router.urls)),
]
