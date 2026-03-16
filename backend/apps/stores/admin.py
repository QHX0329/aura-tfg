"""Configuración del panel de administración para el módulo de tiendas."""

from django.contrib import admin

from .models import Store, StoreChain, UserFavoriteStore


@admin.register(StoreChain)
class StoreChainAdmin(admin.ModelAdmin):
    """Admin para cadenas comerciales."""

    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "slug"]


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    """Admin para tiendas con filtros geoespaciales."""

    list_display = ["name", "chain", "address", "is_local_business", "is_active"]
    list_filter = ["is_local_business", "is_active", "chain"]
    search_fields = ["name", "address"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(UserFavoriteStore)
class UserFavoriteStoreAdmin(admin.ModelAdmin):
    """Admin para tiendas favoritas de usuarios."""

    list_display = ["user", "store", "created_at"]
    list_filter = ["store"]
    search_fields = ["user__username", "store__name"]
