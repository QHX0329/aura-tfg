"""Configuración de administración para la app business."""

from django.contrib import admin

from .models import BusinessProfile, Promotion


@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    """Admin para los perfiles de negocio (PYMEs)."""

    list_display = (
        "business_name",
        "user",
        "tax_id",
        "is_verified",
        "created_at",
    )
    list_filter = ("is_verified", "created_at", "updated_at")
    search_fields = (
        "business_name",
        "tax_id",
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("user",)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    """Admin para las promociones temporales."""

    list_display = (
        "title",
        "product",
        "store",
        "discount_type",
        "discount_value",
        "start_date",
        "end_date",
        "is_active",
    )
    list_filter = ("is_active", "discount_type", "start_date", "end_date")
    search_fields = (
        "title",
        "description",
        "product__name",
        "store__name",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    raw_id_fields = ("product", "store")
