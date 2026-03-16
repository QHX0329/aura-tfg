"""Configuración del panel de administración para el módulo de precios."""

from django.contrib import admin

from .models import Price, PriceAlert


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    """Admin para el modelo Price."""

    list_display = ["product", "store", "price", "source", "is_stale", "verified_at"]
    list_filter = ["source", "is_stale"]
    search_fields = ["product__name", "store__name"]
    readonly_fields = ["created_at", "verified_at"]
    ordering = ["-verified_at"]


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    """Admin para el modelo PriceAlert."""

    list_display = ["user", "product", "target_price", "is_active", "triggered_at"]
    list_filter = ["is_active"]
    search_fields = ["user__username", "product__name"]
    readonly_fields = ["created_at", "triggered_at"]
