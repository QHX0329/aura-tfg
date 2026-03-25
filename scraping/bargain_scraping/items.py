"""
Items de Scrapy para el proyecto BargAIn.

Define los campos de datos extraídos por los spiders antes
de pasar por el pipeline de persistencia.
"""

import scrapy


class ProductPriceItem(scrapy.Item):
    """Item que representa un precio de producto extraído de un supermercado."""

    # Identificación del producto
    product_name = scrapy.Field()        # str — nombre del producto
    barcode = scrapy.Field()             # str | None — EAN-13 si disponible
    category_name = scrapy.Field()       # str | None — categoría del producto

    # Identificación de la tienda
    store_chain = scrapy.Field()         # str — nombre de la cadena (Mercadona, Carrefour…)

    # Precios
    price = scrapy.Field()               # Decimal — precio de venta al público
    unit_price = scrapy.Field()          # Decimal | None — precio por kg/l/unidad
    offer_price = scrapy.Field()         # Decimal | None — precio en oferta
    offer_end_date = scrapy.Field()      # date | None — fin de la oferta

    # Metadata
    url = scrapy.Field()                 # str — URL de origen del dato
