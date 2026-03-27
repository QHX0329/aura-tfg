"""Spider de Coviran para extraer productos y precios desde web y PDF.

Coviran publica contenidos promocionales en HTML y documentos PDF.
Este spider intenta ambas vias y normaliza los resultados al item comun.
"""

from __future__ import annotations

import io
import importlib
import re
from decimal import Decimal, InvalidOperation
from urllib.parse import urljoin

import scrapy
import structlog
from scrapy import Selector

from bargain_scraping.items import ProductPriceItem

logger = structlog.get_logger(__name__)

COVIRAN_START_URLS = [
    "https://www.coviran.es/",
    "https://www.coviran.es/ofertas",
    "https://www.coviran.es/productos",
]

PDF_LINK_PATTERN = re.compile(r'href="(?P<href>[^"]+\.pdf)"', re.I)
PRICE_TOKEN_PATTERN = re.compile(r"([0-9]{1,3}(?:[\.,][0-9]{2}))\s*€")
PDF_ROW_PATTERN = re.compile(r"(?P<name>[A-Za-z0-9][A-Za-z0-9\s\-\.,]{6,180}?)\s+(?P<price>[0-9]{1,3}(?:[\.,][0-9]{2}))\s*€")


class CoviranSpider(scrapy.Spider):
    """Spider para Coviran con soporte de parseo PDF."""

    name = "coviran"
    allowed_domains = ["www.coviran.es", "coviran.es"]

    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 1,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
    }

    def start_requests(self):
        for url in COVIRAN_START_URLS:
            yield scrapy.Request(
                url=url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_page,
                errback=self.errback_handler,
                dont_filter=True,
            )

    def parse_page(self, response):
        """Extrae items de HTML y descubre enlaces PDF/navegacion."""
        selector = Selector(text=response.text)
        for item in _extract_items_from_html(selector, response.url):
            yield item

        for pdf_url in _extract_pdf_links(response.text, response.url):
            if pdf_url in self._seen_links:
                continue
            self._seen_links.add(pdf_url)
            yield scrapy.Request(
                url=pdf_url,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_pdf,
                errback=self.errback_handler,
                dont_filter=True,
            )

        for href in _extract_navigation_links(response.text, response.url):
            if href in self._seen_links:
                continue
            self._seen_links.add(href)
            yield scrapy.Request(
                url=href,
                headers={"User-Agent": _browser_user_agent()},
                callback=self.parse_page,
                errback=self.errback_handler,
            )

    def parse_pdf(self, response):
        """Parsea PDF de ofertas y devuelve filas producto/precio."""
        rows = _extract_rows_from_pdf_bytes(response.body, response.url)
        if not rows:
            logger.info("Coviran PDF sin filas de precio", url=response.url)
            return

        for row in rows:
            yield ProductPriceItem(
                product_name=row["name"],
                store_chain="Coviran",
                price=row["price"],
                unit_price=None,
                offer_price=None,
                offer_end_date=None,
                barcode=None,
                category_name="Catalogo",
                image_url="",
                url=response.url,
            )

    def errback_handler(self, failure):
        logger.error(
            "Error de red en Coviran spider",
            url=failure.request.url,
            error=str(failure.value),
        )

    @property
    def _seen_links(self) -> set[str]:
        if not hasattr(self, "__seen_links"):
            self.__seen_links: set[str] = set(COVIRAN_START_URLS)
        return self.__seen_links


def _extract_pdf_links(html_text: str, base_url: str) -> list[str]:
    return sorted(
        {
            urljoin(base_url, match.group("href"))
            for match in PDF_LINK_PATTERN.finditer(html_text)
        }
    )


def _extract_navigation_links(html_text: str, base_url: str) -> list[str]:
    links = set()
    for match in re.finditer(r'href="(/[^"#]+)"', html_text, re.I):
        href = match.group(1)
        if href.startswith("/wp-"):
            continue
        if any(token in href.lower() for token in ("oferta", "producto", "folleto")):
            links.add(urljoin(base_url, href))
    return sorted(links)


def _extract_items_from_html(selector: Selector, base_url: str) -> list[ProductPriceItem]:
    items: list[ProductPriceItem] = []
    seen: set[tuple[str, str]] = set()

    for anchor in selector.css("a[href]"):
        href = (anchor.attrib.get("href") or "").strip()
        text = _clean_text(" ".join(anchor.css("::text").getall()))
        if not href or not text:
            continue

        price_match = PRICE_TOKEN_PATTERN.search(text)
        if not price_match:
            continue

        name = _clean_text(PRICE_TOKEN_PATTERN.sub("", text))
        price = _parse_price(price_match.group(1))
        if not name or price is None:
            continue

        key = (name.casefold(), str(price))
        if key in seen:
            continue
        seen.add(key)

        items.append(
            ProductPriceItem(
                product_name=name,
                store_chain="Coviran",
                price=price,
                unit_price=None,
                offer_price=None,
                offer_end_date=None,
                barcode=None,
                category_name=None,
                image_url="",
                url=urljoin(base_url, href),
            )
        )

    return items


def _extract_rows_from_pdf_bytes(pdf_bytes: bytes, source_url: str) -> list[dict]:
    """Extrae filas producto/precio desde PDF si pypdf esta disponible."""
    try:
        pypdf_module = importlib.import_module("pypdf")
        PdfReader = getattr(pypdf_module, "PdfReader")
    except Exception:
        logger.warning("pypdf no disponible para Coviran", url=source_url)
        return []

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        logger.warning("No se pudo leer PDF de Coviran", url=source_url, error=str(exc))
        return []

    return _extract_rows_from_pdf_text(full_text)


def _extract_rows_from_pdf_text(full_text: str) -> list[dict]:
    rows: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for line in full_text.splitlines():
        cleaned = _clean_text(line)
        if not cleaned:
            continue
        match = PDF_ROW_PATTERN.search(cleaned)
        if not match:
            continue

        name = _clean_text(match.group("name"))
        price = _parse_price(match.group("price"))
        if len(name) < 6 or price is None:
            continue

        key = (name.casefold(), str(price))
        if key in seen:
            continue
        seen.add(key)
        rows.append({"name": name, "price": price})

    return rows


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
