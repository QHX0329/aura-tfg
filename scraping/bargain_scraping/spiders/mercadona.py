"""
Spider de Mercadona — extrae precios vía la API JSON pública.

No requiere Playwright porque Mercadona expone su catálogo completo
en una API REST pública con formato JSON.

Endpoints:
- Categorías raíz: https://tienda.mercadona.es/api/categories/
- Productos de categoría: https://tienda.mercadona.es/api/categories/{id}/
"""

from decimal import Decimal, InvalidOperation

import scrapy
import structlog

from bargain_scraping.items import ProductPriceItem

logger = structlog.get_logger(__name__)

CATEGORIES_URL = "https://tienda.mercadona.es/api/categories/"
PRODUCTS_URL = "https://tienda.mercadona.es/api/categories/{}/"


class MercadonaSpider(scrapy.Spider):
    """Spider para el catálogo de Mercadona usando la API JSON."""

    name = "mercadona"
    allowed_domains = ["tienda.mercadona.es"]

    # Configuración de cortesía para no sobrecargar el servidor
    custom_settings = {
        "DOWNLOAD_DELAY": 2,
        "CONCURRENT_REQUESTS": 1,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
        "AUTOTHROTTLE_ENABLED": True,
        "AUTOTHROTTLE_TARGET_CONCURRENCY": 1.0,
    }

    def start_requests(self):
        """Punto de entrada: solicita el listado de categorías raíz."""
        yield scrapy.Request(
            url=CATEGORIES_URL,
            callback=self.parse_categories,
            errback=self.errback_handler,
            headers={"Accept": "application/json"},
        )

    def parse_categories(self, response):
        """Parsea la respuesta de categorías y genera requests por cada una."""
        try:
            data = response.json()
        except Exception as exc:
            logger.error("Error parseando JSON de categorías", error=str(exc))
            return

        results = data if isinstance(data, list) else data.get("results", [])

        for category in results:
            cat_id = category.get("id")
            if not cat_id:
                continue

            yield scrapy.Request(
                url=PRODUCTS_URL.format(cat_id),
                callback=self.parse_products,
                errback=self.errback_handler,
                headers={"Accept": "application/json"},
                cb_kwargs={"category_name": category.get("name", "")},
            )

    def parse_products(self, response, category_name: str = ""):
        """Parsea los productos de una categoría y produce items."""
        try:
            data = response.json()
        except Exception as exc:
            logger.error(
                "Error parseando JSON de productos",
                url=response.url,
                error=str(exc),
            )
            return

        # La respuesta puede incluir sub-categorías con productos anidados
        categories = data.get("categories", [])
        if categories:
            for sub in categories:
                for product in sub.get("products", []):
                    item = self._extract_product(product, sub.get("name", category_name))
                    if item:
                        yield item
        else:
            for product in data.get("products", []):
                item = self._extract_product(product, category_name)
                if item:
                    yield item

    def _extract_product(self, product: dict, category_name: str):
        """Extrae campos relevantes de un dict de producto de la API."""
        try:
            display = product.get("display", {})
            price_instructions = product.get("price_instructions", {})

            raw_price = price_instructions.get("unit_price") or price_instructions.get(
                "bulk_price"
            )
            if raw_price is None:
                return None

            price = _to_decimal(raw_price)
            if price is None:
                return None

            unit_price_raw = price_instructions.get("reference_price")
            unit_price = _to_decimal(unit_price_raw)

            ean = product.get("ean") or None

            return ProductPriceItem(
                product_name=display.get("name", product.get("display_name", "")),
                store_chain="Mercadona",
                price=price,
                unit_price=unit_price,
                offer_price=None,
                offer_end_date=None,
                barcode=str(ean) if ean else None,
                category_name=category_name,
                url=response.url if hasattr(self, "_current_response") else "",
            )
        except Exception as exc:
            logger.warning("Error extrayendo producto", error=str(exc), product=product)
            return None

    def errback_handler(self, failure):
        """Manejo de errores de red — loguea y continúa."""
        logger.error(
            "Error de red en Mercadona spider",
            url=failure.request.url,
            error=str(failure.value),
        )

    @property
    def response(self):
        return getattr(self, "_current_response", None)


def _to_decimal(value) -> Decimal | None:
    """Convierte un valor a Decimal o devuelve None si no es posible."""
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None
