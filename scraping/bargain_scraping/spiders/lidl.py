"""
Spider de Lidl — extrae precios usando Playwright para rendering JS.

Lidl España usa una SPA que requiere JavaScript para cargar los productos.
Se integra con scrapy-playwright para gestionar el navegador headless.

URL base: https://www.lidl.es/
"""

import re
from decimal import Decimal, InvalidOperation

import scrapy
import structlog

from bargain_scraping.items import ProductPriceItem

logger = structlog.get_logger(__name__)

# URLs de listado de productos del supermercado Lidl
CATEGORY_URLS = [
    "https://www.lidl.es/p/frutas-y-verduras/c/v00010?offset=0&limit=48",
    "https://www.lidl.es/p/lacteos-y-huevos/c/v00011?offset=0&limit=48",
    "https://www.lidl.es/p/carniceria/c/v00012?offset=0&limit=48",
    "https://www.lidl.es/p/charcuteria/c/v00013?offset=0&limit=48",
    "https://www.lidl.es/p/pescaderia/c/v00014?offset=0&limit=48",
    "https://www.lidl.es/p/panaderia-y-bolleria/c/v00015?offset=0&limit=48",
    "https://www.lidl.es/p/bebidas/c/v00016?offset=0&limit=48",
    "https://www.lidl.es/p/conservas/c/v00017?offset=0&limit=48",
]


class LidlSpider(scrapy.Spider):
    """Spider para el supermercado online de Lidl con soporte Playwright."""

    name = "lidl"
    allowed_domains = ["www.lidl.es"]

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
                    ".product-grid-box, [data-qa='product-tile']", timeout=10000
                )
            except Exception:
                logger.warning("No se encontraron productos en Lidl", url=response.url)
                return

            html = await page.content()

        except Exception as exc:
            logger.error(
                "Error renderizando página de Lidl con Playwright",
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

        # Paginación — buscar siguiente página
        next_url = sel.css(
            "[data-qa='pagination-next']::attr(href), .pagination__btn--next::attr(href)"
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
            ".product-grid-box, [data-qa='product-tile'], .product-tile"
        ):
            try:
                name = (
                    card.css(
                        "[data-qa='product-tile-title']::text, "
                        ".product-grid-box__title::text"
                    ).get("")
                ).strip()

                if not name:
                    continue

                price_text = (
                    card.css(
                        "[data-qa='product-tile-price'] .m-price__price::text, "
                        ".product-grid-box__price .m-price__price::text"
                    ).get("")
                    or card.css(".m-price__price::text").get("")
                ).strip()

                price = _parse_price(price_text)
                if price is None:
                    continue

                unit_price_text = card.css(
                    "[data-qa='product-tile-base-price']::text, .m-price__base-price::text"
                ).get("")
                unit_price = _parse_price(unit_price_text)

                product_url = card.css("a::attr(href)").get("")

                yield ProductPriceItem(
                    product_name=name,
                    store_chain="Lidl",
                    price=price,
                    unit_price=unit_price,
                    offer_price=None,
                    offer_end_date=None,
                    barcode=None,
                    category_name=None,
                    url=response.urljoin(product_url) if product_url else url,
                )
            except Exception as exc:
                logger.warning("Error extrayendo producto de Lidl", error=str(exc))

    def errback_handler(self, failure):
        """Manejo de errores — anti-bot 403 y errores de red se loguan y se omiten."""
        status = getattr(failure.value, "response", None)
        if status and hasattr(status, "status") and status.status == 403:
            logger.warning(
                "Anti-bot 403 en Lidl — página omitida",
                url=failure.request.url,
            )
        else:
            logger.error(
                "Error de red en Lidl spider",
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
