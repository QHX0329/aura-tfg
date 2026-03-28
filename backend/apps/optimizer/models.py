"""
Modelos del dominio optimizer.

Incluye:
- OptimizationResult: resultado de una optimizacion multicriterio de ruta de compra
"""

from django.contrib.gis.db import models as gis_models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class OptimizationResult(models.Model):
    """Resultado de una optimizacion de ruta de compra multicriterio (precio, distancia, tiempo)."""

    shopping_list = models.ForeignKey(
        "shopping_lists.ShoppingList",
        on_delete=models.CASCADE,
        related_name="optimizations",
        verbose_name="Lista de la compra",
    )
    user_location = gis_models.PointField(
        srid=4326,
        help_text="Ubicacion del usuario al optimizar",
        verbose_name="Ubicacion del usuario",
    )
    max_distance_km = models.FloatField(
        default=10.0,
        verbose_name="Radio maximo (km)",
    )
    max_stops = models.IntegerField(
        default=3,
        validators=[MinValueValidator(2), MaxValueValidator(5)],
        verbose_name="Numero maximo de paradas",
    )
    optimization_mode = models.CharField(
        max_length=20,
        choices=[
            ("precio", "Precio"),
            ("distancia", "Distancia"),
            ("balanced", "Equilibrado"),
        ],
        default="balanced",
        verbose_name="Modo de optimizacion",
    )
    w_precio = models.FloatField(default=0.5, verbose_name="Peso precio")
    w_distancia = models.FloatField(default=0.3, verbose_name="Peso distancia")
    w_tiempo = models.FloatField(default=0.2, verbose_name="Peso tiempo")
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio total",
    )
    total_distance_km = models.FloatField(verbose_name="Distancia total (km)")
    estimated_time_minutes = models.FloatField(verbose_name="Tiempo estimado (min)")
    route_data = models.JSONField(
        help_text="Paradas ordenadas con detalle por tienda",
        verbose_name="Datos de ruta",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")

    class Meta:
        verbose_name = "Resultado de optimizacion"
        verbose_name_plural = "Resultados de optimizacion"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Optimizacion #{self.pk} — {self.shopping_list.name} ({self.optimization_mode})"


class OptimizationRouteStop(models.Model):
    """Parada persistida de una optimizacion con relacion directa a tienda y lista."""

    optimization_result = models.ForeignKey(
        OptimizationResult,
        on_delete=models.CASCADE,
        related_name="stops",
        verbose_name="Resultado de optimizacion",
    )
    shopping_list = models.ForeignKey(
        "shopping_lists.ShoppingList",
        on_delete=models.CASCADE,
        related_name="optimization_stops",
        verbose_name="Lista de la compra",
    )
    store = models.ForeignKey(
        "stores.Store",
        on_delete=models.CASCADE,
        related_name="optimization_stops",
        verbose_name="Tienda",
    )
    stop_order = models.PositiveSmallIntegerField(verbose_name="Orden de parada")
    distance_km = models.FloatField(default=0.0, verbose_name="Distancia desde parada previa (km)")
    time_minutes = models.FloatField(default=0.0, verbose_name="Tiempo desde parada previa (min)")
    subtotal_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Subtotal de la parada",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Parada de optimizacion"
        verbose_name_plural = "Paradas de optimizacion"
        ordering = ["stop_order"]
        constraints = [
            models.UniqueConstraint(
                fields=["optimization_result", "stop_order"],
                name="optimizer_route_stop_unique_order",
            )
        ]

    def __str__(self) -> str:
        return (
            f"Opt #{self.optimization_result_id} · "
            f"Parada {self.stop_order} · {self.store.name}"
        )


class OptimizationRouteStopItem(models.Model):
    """Item de compra asignado a una parada con el precio obtenido en optimizacion."""

    stop = models.ForeignKey(
        OptimizationRouteStop,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Parada",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="optimization_stop_items",
        verbose_name="Producto",
    )
    price = models.ForeignKey(
        "prices.Price",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="optimization_stop_items",
        verbose_name="Precio seleccionado",
    )
    query_text = models.CharField(max_length=255, verbose_name="Texto original del item")
    matched_product_name = models.CharField(max_length=255, verbose_name="Producto asignado")
    quantity = models.PositiveSmallIntegerField(default=1, verbose_name="Cantidad")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio unitario")
    line_total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio total de linea",
    )
    similarity_score = models.FloatField(default=0.0, verbose_name="Puntuacion de similitud")
    candidate_rank = models.PositiveSmallIntegerField(default=1, verbose_name="Ranking candidato")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Item de parada optimizada"
        verbose_name_plural = "Items de parada optimizada"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.matched_product_name} x{self.quantity} ({self.stop.store.name})"


class ShoppingListSemanticPreference(models.Model):
    """Preferencia explicita de producto para un texto de item en una lista concreta."""

    shopping_list = models.ForeignKey(
        "shopping_lists.ShoppingList",
        on_delete=models.CASCADE,
        related_name="semantic_preferences",
        verbose_name="Lista de la compra",
    )
    query_text = models.CharField(max_length=255, verbose_name="Texto original del item")
    normalized_query = models.CharField(max_length=255, db_index=True, verbose_name="Texto normalizado")
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="semantic_preferences",
        verbose_name="Producto preferido",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Preferencia semantica de lista"
        verbose_name_plural = "Preferencias semanticas de lista"
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["shopping_list", "normalized_query"],
                name="optimizer_semantic_pref_unique_list_query",
            )
        ]

    def __str__(self) -> str:
        return (
            f"{self.shopping_list.name}: '{self.query_text}' -> {self.product.name}"
        )
