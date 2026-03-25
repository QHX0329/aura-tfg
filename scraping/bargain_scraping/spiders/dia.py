"""
Spider de DIA — extrae precios usando Playwright para rendering JS.

DIA España utiliza una SPA que carga los productos dinámicamente con JS.
Se integra con scrapy-playwright para gestionar el navegador headless.

URL base: https://www.dia.es/compra-online/
"""

import re
from decimal import Decimal, InvalidOperation

import scrapy
import structlog

from bargain_scraping.items import ProductPriceItem

logger = structlog.get_logger(__name__)

# URLs de listado de productos del supermercado DIA
CATEGORY_URLS = [
    "https://www.dia.es/compra-online/frutas-y-verduras/c/10",
    "https://www.dia.es/compra-online/lacteos-y-huevos/c/11",
    "https://www.dia.es/compra-online/carniceria/c/12",
    "https://www.dia.es/compra-online/charcuteria/c/13",
    "https://www.dia.es/compra-online/pescaderia/c/14",
    "https://www.dia.es/compra-online/panaderia-y-bolleria/c/15",
    "https://www.dia.es/compra-online/bebidas/c/16",
    "https://www.dia.es/compra-online/conservas/c/17",
]


class DiaSpider(scrapy.Spider):
    """Spider para la tienda online de DIA con soporte Playwright."""

    name = "dia"
    allowed_domains = ["www.dia.es"]

    custom_settings = {
        "DOWNLOAD_HANDLERS": {
            "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
            "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        },
        "TWISTED_REACTOR": "twisted.internet.asyncioreactor.AsyncioSelectorReactor",
        "DOWNLOAD_DELAY": 3,
        "CONCURRENT_REQUESTS": 1,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
        "PLAYWRIGHT_BROWSER_TYPE": "chromium",
        "PLAYWRIGHT_LAUNCH_OPTIONS": {
            "headless": True,
            "args": ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    }

    def start_requests(self):
        """Genera requests a las categorías usando Playwright."""
        for url in CATEGORY_URLS:
            yield scrapy.Request(
                url=url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_page_goto_kwargs": {"wait_until": "networkidle"},
                },
                callback=self.parse_category,
                errback=self.errback_handler,
            )

    async def parse_category(self, response):
        """Parsea la página de categoría — extrae productos y sigue paginación."""
        page = response.meta.get("playwright_page")

        try:
            # Aceptar cookies si aparecen
            try:
                await page.click("#onetrust-accept-btn-handler", timeout=3000)
            except Exception:
                pass

            # Esperar a que carguen los productos
            try:
                await page.wait_for_selector(
                    ".product-item, [data-component='product-tile']", timeout=10000
                )
            except Exception:
                logger.warning("No se encontraron productos en DIA", url=response.url)
                return

            html = await page.content()

        except Exception as exc:
            logger.error(
                "Error renderizando página de DIA con Playwright",
                url=response.url,
                error=str(exc),
            )
            return
        finally:
            if page:
                await page.close()

        from scrapy import Selector

        sel = Selector(text=html)
        yield from self._extract_products(sel, response.url)

        # Paginación
        next_url = sel.css(
            ".pagination__next::attr(href), [aria-label='Siguiente página']::attr(href)"
        ).get()
        if next_url:
            yield scrapy.Request(
                url=response.urljoin(next_url),
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_page_goto_kwargs": {"wait_until": "networkidle"},
                },
                callback=self.parse_category,
                errback=self.errback_handler,
            )

    def _extract_products(self, sel, url: str):
        """Extrae los items de producto del HTML renderizado."""
        for card in sel.css(
            ".product-item, [data-component='product-tile'], .product-tile"
        ):
            try:
                name = (
                    card.css(
                        ".product-item__title::text, "
                        "[data-component='product-name']::text, "
                        ".product-name::text"
                    ).get("")
                ).strip()

                if not name:
                    continue

                # Precio normal
                price_text = (
                    card.css(
                        ".product-item__price--current::text, "
                        "[data-component='product-price']::text, "
                        ".price-current::text"
                    ).get("")
                ).strip()

                price = _parse_price(price_text)
                if price is None:
                    continue

                # Precio por unidad
                unit_price_text = card.css(
                    ".product-item__price-per-unit::text, "
                    "[data-component='unit-price']::text"
                ).get("")
                unit_price = _parse_price(unit_price_text)

                # Precio de oferta
                offer_price_text = card.css(
                    ".product-item__price--offer::text, "
                    "[data-component='offer-price']::text, "
                    ".price-offer::text"
                ).get("")
                offer_price = _parse_price(offer_price_text)

                product_url = card.css("a::attr(href)").get("")

                yield ProductPriceItem(
                    product_name=name,
                    store_chain="DIA",
                    price=price,
                    unit_price=unit_price,
                    offer_price=offer_price,
                    offer_end_date=None,
                    barcode=None,
                    category_name=None,
                    url=response.urljoin(product_url) if product_url else url,
                )
            except Exception as exc:
                logger.warning("Error extrayendo producto de DIA", error=str(exc))

    def errback_handler(self, failure):
        """Manejo de errores — anti-bot 403 y errores de red se loguan y se omiten."""
        status = getattr(failure.value, "response", None)
        if status and hasattr(status, "status") and status.status == 403:
            logger.warning(
                "Anti-bot 403 en DIA — página omitida",
                url=failure.request.url,
            )
        else:
            logger.error(
                "Error de red en DIA spider",
                url=failure.request.url,
                error=str(failure.value),
            )


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_price(text: str) -> Decimal | None:
    """Convierte texto de precio ('1,29 €') a Decimal o None."""
    if not text:
        return None
    cleaned = re.sub(r"[^\d,\.]", "", text).replace(",", ".")
    try:
        return Decimal(cleaned) if cleaned else None
    except InvalidOperation:
        return None
