"""Spider de Eroski para extraer productos y precios.

Eroski publica fichas de producto con datos estructurados (JSON-LD)
que incluyen nombre y precio. Este spider descubre enlaces de ficha
y parsea cada producto con una estrategia robusta de fallback.
"""

from __future__ import annotations

import json
import re
from decimal import Decimal, InvalidOperation
from urllib.parse import urljoin

import scrapy
import structlog

from bargain_scraping.items import ProductPriceItem

logger = structlog.get_logger(__name__)

EROSKI_START_URLS = [
    "https://supermercado.eroski.es/es/supermercado/alimentacion/",
    "https://supermercado.eroski.es/es/search/results/?text=leche",
    "https://supermercado.eroski.es/es/search/results/?text=arroz",
]

PRODUCT_LINK_PATTERN = re.compile(r'href="(?P<href>/es/productdetail/[^"]+/)"', re.IGNORECASE)
PRICE_TOKEN_PATTERN = re.compile(r'([0-9]{1,3}(?:[\.,][0-9]{2}))\s*€')


class EroskiSpider(scrapy.Spider):
    """Spider de Eroski basado en productdetail + JSON-LD."""

    name = "eroski"
    allowed_domains = ["supermercado.eroski.es", "eroski.es"]

    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 2,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
    }

    def start_requests(self):
        """Arranca desde catalogo y paginas de busqueda publicas."""
        for url in EROSKI_START_URLS:
            yield scrapy.Request(
                url=url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_listing,
                errback=self.errback_handler,
                dont_filter=True,
            )

    def parse_listing(self, response):
        """Descubre enlaces de ficha y sigue paginacion ligera."""
        for product_url in _extract_product_links(response.text, response.url):
            if product_url in self._seen_links:
                continue
            self._seen_links.add(product_url)
            yield scrapy.Request(
                url=product_url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_product,
                errback=self.errback_handler,
            )

        for next_link in _extract_next_links(response.text, response.url):
            if next_link in self._seen_links:
                continue
            self._seen_links.add(next_link)
            yield scrapy.Request(
                url=next_link,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_listing,
                errback=self.errback_handler,
            )

    def parse_product(self, response):
        """Parsea una ficha de producto y genera un ProductPriceItem."""
        item = _extract_product_from_html(response.text, response.url)
        if item is None:
            logger.warning("Eroski producto sin precio parseable", url=response.url)
            return
        yield item

    def errback_handler(self, failure):
        """Registra errores de red sin detener la ejecucion."""
        logger.error(
            "Error de red en Eroski spider",
            url=failure.request.url,
            error=str(failure.value),
        )

    @property
    def _seen_links(self) -> set[str]:
        if not hasattr(self, "__seen_links"):
            self.__seen_links: set[str] = set(EROSKI_START_URLS)
        return self.__seen_links


def _extract_product_links(html_text: str, base_url: str) -> list[str]:
    """Extrae enlaces de fichas productdetail."""
    return sorted(
        {
            urljoin(base_url, match.group("href"))
            for match in PRODUCT_LINK_PATTERN.finditer(html_text)
        }
    )


def _extract_next_links(html_text: str, base_url: str) -> list[str]:
    """Extrae enlaces de paginacion comunes de Eroski."""
    links = set()
    for match in re.finditer(r'href="([^"]*page=\d+[^"]*)"', html_text, re.IGNORECASE):
        links.add(urljoin(base_url, match.group(1)))
    return sorted(links)


def _extract_product_from_html(html_text: str, source_url: str) -> ProductPriceItem | None:
    """Obtiene nombre y precio desde JSON-LD o fallback textual."""
    for product_doc in _extract_json_ld_product_docs(html_text):
        name = str(product_doc.get("name") or "").strip()
        price = _parse_price(_extract_offer_price_value(product_doc.get("offers")))
        if not name or price is None:
            continue

        image_value = product_doc.get("image")
        image_url = image_value[0] if isinstance(image_value, list) and image_value else image_value
        barcode = str(product_doc.get("gtin13") or product_doc.get("sku") or "").strip() or None

        return ProductPriceItem(
            product_name=name,
            store_chain="Eroski",
            price=price,
            unit_price=None,
            offer_price=None,
            offer_end_date=None,
            barcode=barcode,
            category_name=None,
            image_url=str(image_url or "").strip(),
            url=source_url,
        )

    name_match = re.search(r"<h1[^>]*>(.*?)</h1>", html_text, re.IGNORECASE | re.DOTALL)
    name = _clean_text(name_match.group(1)) if name_match else ""
    price_match = PRICE_TOKEN_PATTERN.search(html_text)
    price = _parse_price(price_match.group(1)) if price_match else None
    if not name or price is None:
        return None

    return ProductPriceItem(
        product_name=name,
        store_chain="Eroski",
        price=price,
        unit_price=None,
        offer_price=None,
        offer_end_date=None,
        barcode=None,
        category_name=None,
        image_url="",
        url=source_url,
    )


def _extract_json_ld_product_docs(html_text: str) -> list[dict]:
    """Devuelve objetos Product encontrados en scripts JSON-LD."""
    products: list[dict] = []
    for raw in re.findall(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        html_text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        try:
            parsed = json.loads(raw.strip())
        except json.JSONDecodeError:
            continue

        for candidate in _iterate_json_candidates(parsed):
            if not isinstance(candidate, dict):
                continue
            type_value = str(candidate.get("@type") or "").lower()
            if type_value == "product":
                products.append(candidate)
    return products


def _iterate_json_candidates(value: object):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from _iterate_json_candidates(nested)
    elif isinstance(value, list):
        for item in value:
            yield from _iterate_json_candidates(item)


def _extract_offer_price_value(offers: object) -> object:
    if isinstance(offers, dict):
        return offers.get("price")
    if isinstance(offers, list):
        for entry in offers:
            if isinstance(entry, dict) and entry.get("price") is not None:
                return entry.get("price")
    return None


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value)).strip()


def _browser_user_agent() -> str:
    return (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )


def _parse_price(value: object) -> Decimal | None:
    if value is None:
        return None
    text = str(value).strip()
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," in text:
        text = text.replace(",", ".")
    text = re.sub(r"[^\d\.]", "", text)
    try:
        return Decimal(text)
    except (InvalidOperation, ValueError):
        return None
