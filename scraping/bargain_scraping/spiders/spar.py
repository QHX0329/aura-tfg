"""Spider de Spar para extraer productos y precios publicos.

Spar expone catalogo de productos en `spar.es/productos-spar/`.
El spider descubre enlaces de producto y parsea nombre/precio cuando
la web los publica en HTML o JSON-LD.
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

SPAR_START_URLS = [
    "https://spar.es/productos-spar/",
    "https://spar.es/productos-spar/bebidas/",
    "https://spar.es/productos-spar/alimentacion/",
]

PRODUCT_LINK_PATTERN = re.compile(r'href="(?P<href>https://spar\.es/productos-spar/[^"]+/)"', re.I)
PRICE_TOKEN_PATTERN = re.compile(r"([0-9]{1,3}(?:[\.,][0-9]{2}))\s*€")


class SparSpider(scrapy.Spider):
    """Spider para Spar basado en paginas de producto del catalogo."""

    name = "spar"
    allowed_domains = ["spar.es", "www.spar.es"]

    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 2,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
    }

    def start_requests(self):
        """Inicia crawling de secciones de catalogo publico."""
        for url in SPAR_START_URLS:
            yield scrapy.Request(
                url=url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_listing,
                errback=self.errback_handler,
                dont_filter=True,
            )

    def parse_listing(self, response):
        """Descubre enlaces de producto y sigue enlaces internos del catalogo."""
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

        for nav_url in _extract_catalog_navigation_links(response.text, response.url):
            if nav_url in self._seen_links:
                continue
            self._seen_links.add(nav_url)
            yield scrapy.Request(
                url=nav_url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_listing,
                errback=self.errback_handler,
            )

    def parse_product(self, response):
        """Parsea una pagina de producto y devuelve item si hay precio."""
        item = _extract_product_from_html(response.text, response.url)
        if item is None:
            logger.info("Spar producto sin precio publico", url=response.url)
            return
        yield item

    def errback_handler(self, failure):
        logger.error(
            "Error de red en Spar spider",
            url=failure.request.url,
            error=str(failure.value),
        )

    @property
    def _seen_links(self) -> set[str]:
        if not hasattr(self, "__seen_links"):
            self.__seen_links: set[str] = set(SPAR_START_URLS)
        return self.__seen_links


def _extract_product_links(html_text: str, base_url: str) -> list[str]:
    links = {
        urljoin(base_url, match.group("href"))
        for match in PRODUCT_LINK_PATTERN.finditer(html_text)
    }
    return sorted(links)


def _extract_catalog_navigation_links(html_text: str, base_url: str) -> list[str]:
    links = set()
    for match in re.finditer(r'href="(/productos-spar/[^"]+/)"', html_text, re.I):
        links.add(urljoin(base_url, match.group(1)))
    return sorted(links)


def _extract_product_from_html(html_text: str, source_url: str) -> ProductPriceItem | None:
    name = _extract_name(html_text)
    if not name:
        return None

    price = _extract_price_from_json_ld(html_text)
    if price is None:
        token = PRICE_TOKEN_PATTERN.search(html_text)
        price = _parse_price(token.group(1)) if token else None

    if price is None:
        return None

    return ProductPriceItem(
        product_name=name,
        store_chain="Spar",
        price=price,
        unit_price=None,
        offer_price=None,
        offer_end_date=None,
        barcode=None,
        category_name=None,
        image_url="",
        url=source_url,
    )


def _extract_name(html_text: str) -> str:
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html_text, flags=re.I | re.S)
    if h1:
        return _clean_text(h1.group(1))

    og = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html_text, flags=re.I)
    return _clean_text(og.group(1)) if og else ""


def _extract_price_from_json_ld(html_text: str) -> Decimal | None:
    for raw in re.findall(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        html_text,
        flags=re.I | re.S,
    ):
        try:
            parsed = json.loads(raw.strip())
        except json.JSONDecodeError:
            continue

        for candidate in _iterate_json_candidates(parsed):
            if not isinstance(candidate, dict):
                continue
            if str(candidate.get("@type") or "").lower() != "product":
                continue
            offers = candidate.get("offers")
            if isinstance(offers, dict):
                price = _parse_price(offers.get("price"))
                if price is not None:
                    return price
    return None


def _iterate_json_candidates(value: object):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from _iterate_json_candidates(nested)
    elif isinstance(value, list):
        for item in value:
            yield from _iterate_json_candidates(item)


def _clean_text(value: str) -> str:
    without_tags = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", without_tags).strip()


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
