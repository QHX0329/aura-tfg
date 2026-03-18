"""URLs para el dominio shopping_lists."""

from rest_framework.routers import DefaultRouter

from .views import ListTemplateViewSet, ShoppingListViewSet

router = DefaultRouter()
router.register(r"templates", ListTemplateViewSet, basename="listtemplate")
router.register(r"", ShoppingListViewSet, basename="shoppinglist")

urlpatterns = router.urls
