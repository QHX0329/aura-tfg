"""
Vistas del modulo optimizer.

Expone el endpoint POST /api/v1/optimize/ para calcular la ruta
de compra optima multicriterio.
"""

from contextlib import suppress
from decimal import Decimal, InvalidOperation

import structlog
from django.contrib.gis.geos import Point
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import OptimizationError, StoreNotFoundError

from .models import OptimizationResult, OptimizationRouteStop, OptimizationRouteStopItem
from .serializers import (
    LatestOptimizationQuerySerializer,
    OptimizeRequestSerializer,
    OptimizeResponseSerializer,
)
from .services.solver import optimize_shopping_list

logger = structlog.get_logger(__name__)


def _to_decimal(value: object, fallback: str = "0") -> Decimal:
    """Convierte valores numericos a Decimal de forma segura."""
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal(fallback)


class OptimizeView(APIView):
    """
    POST /api/v1/optimize/

    Calcula la ruta optima de compra para la lista indicada segun
    la ubicacion y preferencias del usuario.
    """

    permission_classes = [IsAuthenticated]

    def _get_user_shopping_list(self, request: Request, shopping_list_id: int):
        """Obtiene una lista de compra del usuario autenticado o 404."""
        from apps.shopping_lists.models import ShoppingList

        return get_object_or_404(
            ShoppingList,
            id=shopping_list_id,
            owner=request.user,
        )

    def _persist_route_breakdown(self, optimization_result: OptimizationResult) -> None:
        """Guarda paradas e items de precio de la ruta en modelos relacionales."""
        from apps.prices.models import Price
        from apps.products.models import Product
        from apps.stores.models import Store

        route_data = optimization_result.route_data or []
        if not route_data:
            return

        store_ids: set[int] = set()
        product_ids: set[int] = set()
        price_ids: set[int] = set()

        for stop_payload in route_data:
            try:
                store_ids.add(int(stop_payload.get("store_id", 0)))
            except (TypeError, ValueError):
                continue
            for product_payload in stop_payload.get("products", []):
                with suppress(TypeError, ValueError):
                    product_ids.add(int(product_payload.get("matched_product_id", 0)))
                with suppress(TypeError, ValueError):
                    price_ids.add(int(product_payload.get("matched_price_id", 0)))

        stores_by_id = Store.objects.in_bulk(store_ids)
        products_by_id = Product.objects.in_bulk(product_ids)
        prices_by_id = Price.objects.in_bulk(price_ids)

        for index, stop_payload in enumerate(route_data, start=1):
            try:
                store_id = int(stop_payload.get("store_id", 0))
            except (TypeError, ValueError):
                continue

            store = stores_by_id.get(store_id)
            if not store:
                continue

            subtotal_price = Decimal("0.00")
            for product_payload in stop_payload.get("products", []):
                unit_price = _to_decimal(product_payload.get("price", 0))
                quantity = max(0, int(product_payload.get("quantity", 0) or 0))
                subtotal_price += unit_price * quantity

            stop = OptimizationRouteStop.objects.create(
                optimization_result=optimization_result,
                shopping_list=optimization_result.shopping_list,
                store=store,
                stop_order=index,
                distance_km=float(stop_payload.get("distance_km", 0.0) or 0.0),
                time_minutes=float(stop_payload.get("time_minutes", 0.0) or 0.0),
                subtotal_price=subtotal_price,
            )

            stop_items: list[OptimizationRouteStopItem] = []
            for product_payload in stop_payload.get("products", []):
                try:
                    product_id = int(product_payload.get("matched_product_id", 0))
                except (TypeError, ValueError):
                    product_id = 0
                try:
                    price_id = int(product_payload.get("matched_price_id", 0))
                except (TypeError, ValueError):
                    price_id = 0

                quantity = max(0, int(product_payload.get("quantity", 0) or 0))
                unit_price = _to_decimal(product_payload.get("price", 0))

                stop_items.append(
                    OptimizationRouteStopItem(
                        stop=stop,
                        product=products_by_id.get(product_id),
                        price=prices_by_id.get(price_id),
                        query_text=str(product_payload.get("query_text", "")),
                        matched_product_name=str(
                            product_payload.get("matched_product_name", "")
                        ),
                        quantity=quantity,
                        unit_price=unit_price,
                        line_total_price=unit_price * quantity,
                        similarity_score=float(
                            product_payload.get("similarity_score", 0.0) or 0.0
                        ),
                        candidate_rank=max(
                            1,
                            int(product_payload.get("candidate_rank", 1) or 1),
                        ),
                    )
                )

            if stop_items:
                OptimizationRouteStopItem.objects.bulk_create(stop_items)

    def _persist_optimization_result(
        self,
        shopping_list,
        lat: float,
        lng: float,
        max_distance_km: float,
        max_stops: int,
        weights: dict[str, float],
        optimize_output: dict,
    ) -> OptimizationResult:
        """Crea resultado de optimizacion y su desglose relacional en una transaccion."""
        with transaction.atomic():
            optimization_result = OptimizationResult.objects.create(
                shopping_list=shopping_list,
                user_location=Point(lng, lat, srid=4326),
                max_distance_km=max_distance_km,
                max_stops=max_stops,
                optimization_mode="balanced",
                w_precio=weights["precio"],
                w_distancia=weights["distancia"],
                w_tiempo=weights["tiempo"],
                total_price=optimize_output["total_price"],
                total_distance_km=optimize_output["total_distance_km"],
                estimated_time_minutes=optimize_output["estimated_time_minutes"],
                route_data=optimize_output["route_data"],
            )
            self._persist_route_breakdown(optimization_result)
        return optimization_result

    def get(self, request: Request) -> Response:
        """Recupera la ultima ruta optimizada persistida para una lista del usuario."""
        query_serializer = LatestOptimizationQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        shopping_list_id = query_serializer.validated_data["shopping_list_id"]

        shopping_list = self._get_user_shopping_list(request, shopping_list_id)
        latest = shopping_list.optimizations.order_by("-created_at").first()

        if latest is None:
            return Response({"success": True, "data": None}, status=200)

        response_serializer = OptimizeResponseSerializer(latest)
        return Response({"success": True, "data": response_serializer.data}, status=200)

    def post(self, request: Request) -> Response:
        """
        Ejecuta el algoritmo de optimizacion multicriterio.

        Args:
            request: Peticion con shopping_list_id, lat, lng y parametros opcionales.

        Returns:
            Response con el resultado de la optimizacion o error apropiado.
        """
        serializer = OptimizeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        shopping_list_id = data["shopping_list_id"]
        shopping_list = self._get_user_shopping_list(request, shopping_list_id)

        lat = data["lat"]
        lng = data["lng"]
        max_distance_km = data["max_distance_km"]
        max_stops = data["max_stops"]
        weights = {
            "precio": data["w_precio"],
            "distancia": data["w_distancia"],
            "tiempo": data["w_tiempo"],
        }

        try:
            optimized_payload = optimize_shopping_list(
                shopping_list_id=shopping_list_id,
                user_lat=lat,
                user_lng=lng,
                max_distance_km=max_distance_km,
                max_stops=max_stops,
                weights=weights,
            )
        except StoreNotFoundError:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "OPTIMIZER_NO_STORES_IN_RADIUS",
                        "message": (
                            "No hay tiendas en tu radio de busqueda. Prueba ampliando el radio."
                        ),
                        "details": {},
                    },
                },
                status=404,
            )
        except OptimizationError as exc:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "OPTIMIZATION_FAILED",
                        "message": str(exc.detail),
                        "details": {},
                    },
                },
                status=422,
            )
        except Exception as exc:
            logger.error("optimize_unexpected_error", error=str(exc), exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "OPTIMIZATION_FAILED",
                        "message": "Error inesperado al calcular la ruta optimizada.",
                        "details": {},
                    },
                },
                status=500,
            )

        optimization_result = self._persist_optimization_result(
            shopping_list=shopping_list,
            lat=lat,
            lng=lng,
            max_distance_km=max_distance_km,
            max_stops=max_stops,
            weights=weights,
            optimize_output=optimized_payload,
        )

        response_serializer = OptimizeResponseSerializer(optimization_result)
        return Response({"success": True, "data": response_serializer.data}, status=200)
