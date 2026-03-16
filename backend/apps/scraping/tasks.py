"""Tareas Celery relacionadas con scraping."""

import structlog
from celery import shared_task

logger = structlog.get_logger(__name__)


@shared_task(bind=True, ignore_result=True)
def run_spider(self, spider_name: str) -> dict[str, str]:
    """Stub task — implementado en Fase 4.

    Args:
        spider_name: Nombre del spider a lanzar (mercadona, carrefour, etc.).

    Returns:
        Dict con status ``stub`` y el nombre del spider.
    """
    logger.info("run_spider stub called", spider=spider_name)
    return {"status": "stub", "spider": spider_name}
