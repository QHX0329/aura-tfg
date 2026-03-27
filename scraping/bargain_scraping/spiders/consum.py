"""Spider de Consum para extraer productos y precios desde tienda online.

Consum publica fichas de producto bajo `/es/p/...` con metadata JSON-LD.
El spider descubre enlaces de ficha y parsea nombre/precio/barcode.
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

CONSUM_START_URLS = [
    "https://tienda.consum.es/es/s?q=leche",
    "https://tienda.consum.es/es/s?q=atun",
    "https://tienda.consum.es/es/s?q=aceite",
    "https://tienda.consum.es/es/p/aceite-de-oliva-virgen-extra/7264617",
]

PRODUCT_LINK_PATTERN = re.compile(r'href="(?P<href>/es/p/[^"]+/\d+)"', re.I)
PRICE_TOKEN_PATTERN = re.compile(r"([0-9]{1,3}(?:[\.,][0-9]{2}))\s*€")


class ConsumSpider(scrapy.Spider):
    """Spider para Consum basado en JSON-LD de fichas de producto."""

    name = "consum"
    allowed_domains = ["tienda.consum.es", "consum.es"]

    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 2,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
    }

    def start_requests(self):
        """Inicia desde busquedas y una ficha valida de referencia."""
        for url in CONSUM_START_URLS:
            yield scrapy.Request(
                url=url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_page,
                errback=self.errback_handler,
                dont_filter=True,
            )

    def parse_page(self, response):
        """Extrae item si es ficha y descubre nuevas fichas enlazadas."""
        if "/es/p/" in response.url:
            item = _extract_product_from_html(response.text, response.url)
            if item is not None:
                yield item
            else:
                logger.warning("Consum ficha sin precio parseable", url=response.url)

        for product_url in _extract_product_links(response.text, response.url):
            if product_url in self._seen_links:
                continue
            self._seen_links.add(product_url)
            yield scrapy.Request(
                url=product_url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_page,
                errback=self.errback_handler,
            )

    def errback_handler(self, failure):
        logger.error(
            "Error de red en Consum spider",
            url=failure.request.url,
            error=str(failure.value),
        )

    @property
    def _seen_links(self) -> set[str]:
        if not hasattr(self, "__seen_links"):
            self.__seen_links: set[str] = set(CONSUM_START_URLS)
        return self.__seen_links


def _extract_product_links(html_text: str, base_url: str) -> list[str]:
    links = {
        urljoin(base_url, match.group("href"))
        for match in PRODUCT_LINK_PATTERN.finditer(html_text)
    }
    return sorted(links)


def _extract_product_from_html(html_text: str, source_url: str) -> ProductPriceItem | None:
    product_doc = _extract_json_ld_product_doc(html_text)

    if product_doc is not None:
        name = str(product_doc.get("name") or "").strip()
        offers = product_doc.get("offers")
        price = _parse_price(offers.get("price") if isinstance(offers, dict) else None)
        barcode = str(product_doc.get("gtin13") or product_doc.get("sku") or "").strip() or None
        image_value = product_doc.get("image")
        image_url = image_value[0] if isinstance(image_value, list) and image_value else image_value

        if name and price is not None:
            return ProductPriceItem(
                product_name=name,
                store_chain="Consum",
                price=price,
                unit_price=None,
                offer_price=None,
                offer_end_date=None,
                barcode=barcode,
                category_name=None,
                image_url=str(image_url or ""),
                url=source_url,
            )

    name_match = re.search(r"<h1[^>]*>(.*?)</h1>", html_text, flags=re.I | re.S)
    price_match = PRICE_TOKEN_PATTERN.search(html_text)
    if not name_match or not price_match:
        return None

    name = _clean_text(name_match.group(1))
    price = _parse_price(price_match.group(1))
    if not name or price is None:
        return None

    return ProductPriceItem(
        product_name=name,
        store_chain="Consum",
        price=price,
        unit_price=None,
        offer_price=None,
        offer_end_date=None,
        barcode=None,
        category_name=None,
        image_url="",
        url=source_url,
    )


def _extract_json_ld_product_doc(html_text: str) -> dict | None:
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
            if str(candidate.get("@type") or "").lower() == "product":
                return candidate
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
