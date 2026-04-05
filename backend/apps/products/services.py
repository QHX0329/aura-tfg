"""
Servicios del dominio products.

Funciones:
- approve_proposal: aprueba una propuesta, crea Product y Price en transaccion atomica.
"""

from django.db import transaction
from django.utils import timezone

from apps.products.models import Product, ProductProposal


def approve_proposal(proposal: ProductProposal) -> Product:
    """Aprueba una propuesta y materializa sus efectos en Product y Price.

    Reutiliza el producto existente cuando el barcode ya está registrado para
    mantener la operación idempotente.
    """
    from apps.prices.models import Price

    with transaction.atomic():
        barcode = proposal.barcode or None
        if barcode:
            product, _ = Product.objects.get_or_create(
                barcode=barcode,
                defaults={
                    "name": proposal.name,
                    "brand": proposal.brand,
                    "category": proposal.category,
                    "image_url": proposal.image_url,
                    "is_active": True,
                },
            )
        else:
            product = Product.objects.create(
                name=proposal.name,
                brand=proposal.brand,
                barcode=None,
                category=proposal.category,
                image_url=proposal.image_url,
                is_active=True,
            )

        if proposal.price is not None and proposal.store is not None:
            Price.objects.update_or_create(
                product=product,
                store=proposal.store,
                source=Price.Source.CROWDSOURCING,
                defaults={
                    "price": proposal.price,
                    "unit_price": proposal.unit_price,
                    "is_stale": False,
                    "verified_at": timezone.now(),
                },
            )

        proposal.status = ProductProposal.Status.APPROVED
        proposal.save(update_fields=["status"])

    return product
