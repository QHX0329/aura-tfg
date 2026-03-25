"""
Pipelines de Scrapy para el proyecto BargAIn.

PriceUpsertPipeline: persiste cada ProductPriceItem en el modelo Price de Django
usando update_or_create para evitar duplicados en re-ejecuciones.
"""

import os
import sys

import django
import structlog
from scrapy.exceptions import DropItem

# ── Configurar Django antes de importar modelos ──────────────────────────────

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

# Asegurar que el directorio de backend está en el path para que Django
# encuentre los módulos de apps/ y config/
_BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "backend")
)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

django.setup()

# ── Importaciones Django (después de setup) ──────────────────────────────────

from django.utils import timezone  # noqa: E402

from apps.prices.models import Price  # noqa: E402
from apps.products.models import Product  # noqa: E402
from apps.stores.models import Store  # noqa: E402

logger = structlog.get_logger(__name__)


class PriceUpsertPipeline:
    """Pipeline que escribe precios extraídos en el modelo Price de Django.

    Estrategia de matching:
    1. Intenta encontrar el producto por código de barras (EAN-13).
    2. Si no hay barcode, hace fuzzy match por nombre (token_sort_ratio >= 80).
    3. La tienda se busca por nombre de cadena (case-insensitive).
    Si alguno de los dos no encuentra coincidencia, el item se descarta.
    """

    def __init__(self):
        self._processed = 0
        self._matched = 0
        self._dropped = 0

    def open_spider(self, spider) -> None:
        """Llamado al inicio del spider."""
        logger.info("PriceUpsertPipeline abierto", spider=spider.name)
        self._processed = 0
        self._matched = 0
        self._dropped = 0

    def close_spider(self, spider) -> None:
        """Llamado al finalizar el spider — registra resumen."""
        logger.info(
            "PriceUpsertPipeline cerrado",
            spider=spider.name,
            processed=self._processed,
            matched=self._matched,
            dropped=self._dropped,
        )

    def process_item(self, item, spider):
        """Procesa un item y lo persiste en la BD o lo descarta.

        Args:
            item: ProductPriceItem con los datos del producto.
            spider: Spider que generó el item.

        Returns:
            El item procesado (para compatibilidad con otros pipelines).

        Raises:
            DropItem: Si no se puede hacer match de producto o tienda.
        """
        self._processed += 1

        # ── Buscar producto ──────────────────────────────────────────────────
        product = self._match_product(item)
        if product is None:
            self._dropped += 1
            logger.warning(
                "Producto no encontrado — item descartado",
                product_name=item.get("product_name"),
                barcode=item.get("barcode"),
                spider=spider.name,
            )
            raise DropItem(f"Producto no encontrado: {item.get('product_name')}")

        # ── Buscar tienda ────────────────────────────────────────────────────
        store = self._match_store(item)
        if store is None:
            self._dropped += 1
            logger.warning(
                "Tienda no encontrada — item descartado",
                store_chain=item.get("store_chain"),
                spider=spider.name,
            )
            raise DropItem(f"Tienda no encontrada: {item.get('store_chain')}")

        # ── Upsert del precio ────────────────────────────────────────────────
        Price.objects.update_or_create(
            product=product,
            store=store,
            defaults={
                "price": item["price"],
                "unit_price": item.get("unit_price"),
                "offer_price": item.get("offer_price"),
                "offer_end_date": item.get("offer_end_date"),
                "source": "scraping",
                "verified_at": timezone.now(),
                "is_stale": False,
            },
        )

        self._matched += 1
        logger.debug(
            "Precio upserted",
            product=product.name,
            store=store.name,
            price=str(item["price"]),
            spider=spider.name,
        )

        return item

    # ── Helpers privados ─────────────────────────────────────────────────────

    def _match_product(self, item):
        """Devuelve el Product que mejor coincide con el item, o None."""
        barcode = item.get("barcode")

        # 1. Match exacto por barcode
        if barcode:
            try:
                return Product.objects.get(barcode=barcode)
            except Product.DoesNotExist:
                pass

        # 2. Fuzzy match por nombre
        product_name = item.get("product_name", "")
        if not product_name:
            return None

        try:
            from thefuzz import fuzz
        except ImportError:
            logger.error("thefuzz no instalado — solo se usa match exacto por barcode")
            return None

        best_product = None
        best_score = 0

        for product in Product.objects.filter(is_active=True).only("id", "name", "normalized_name"):
            score = fuzz.token_sort_ratio(
                product_name.lower(), product.normalized_name or product.name.lower()
            )
            if score > best_score:
                best_score = score
                best_product = product

        if best_score >= 80:
            return best_product

        return None

    def _match_store(self, item):
        """Devuelve la primera Store que coincide con el chain_name del item, o None."""
        store_chain = item.get("store_chain", "")
        if not store_chain:
            return None

        qs = Store.objects.filter(
            chain__name__icontains=store_chain, is_active=True
        ).select_related("chain").first()

        return qs
