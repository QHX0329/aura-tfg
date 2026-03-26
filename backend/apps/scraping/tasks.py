"""Tareas Celery relacionadas con scraping.

Cada spider se ejecuta en un proceso separado para aislar el reactor
de Twisted de Celery y evitar conflictos de event loop.
"""

import os
import subprocess
import sys

import structlog
from celery import shared_task

logger = structlog.get_logger(__name__)


SPIDER_MAP: dict[str, str] = {
    "mercadona": "bargain_scraping.spiders.mercadona.MercadonaSpider",
    "carrefour": "bargain_scraping.spiders.carrefour.CarrefourSpider",
    "lidl": "bargain_scraping.spiders.lidl.LidlSpider",
    "dia": "bargain_scraping.spiders.dia.DiaSpider",
}


def _resolve_backend_dir() -> str:
    """Resuelve la raiz del proyecto Django dentro del contenedor."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _resolve_scraping_dir() -> str:
    """Localiza el proyecto Scrapy con validacion explicita.

    La busqueda por candidatos evita depender de una estructura de paths
    fragil entre entorno local y contenedores Docker.
    """
    backend_dir = _resolve_backend_dir()
    repo_root = os.path.abspath(os.path.join(backend_dir, ".."))

    candidates: list[str] = []
    env_dir = os.environ.get("SCRAPING_PROJECT_DIR")
    if env_dir:
        candidates.append(env_dir)

    candidates.extend(
        [
            os.path.join(repo_root, "scraping"),
            "/scraping",
        ]
    )

    for candidate in candidates:
        scrapy_cfg = os.path.join(candidate, "scrapy.cfg")
        package_dir = os.path.join(candidate, "bargain_scraping")
        if os.path.isfile(scrapy_cfg) and os.path.isdir(package_dir):
            return candidate

    checked = ", ".join(candidates)
    raise FileNotFoundError(
        "No se encontro el proyecto Scrapy. "
        f"Rutas comprobadas: {checked}. "
        "Monta ./scraping en el contenedor o define SCRAPING_PROJECT_DIR."
    )


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def run_spider(self, spider_name: str) -> dict[str, str]:
    """Lanza un spider de Scrapy en un proceso hijo separado via subprocess.

    subprocess.Popen no tiene la restriccion de multiprocessing.Process
    sobre procesos daemonicos, lo que permite su uso desde workers Celery.
    """
    if spider_name not in SPIDER_MAP:
        raise ValueError(
            f"Spider desconocido: '{spider_name}'. "
            f"Spiders disponibles: {list(SPIDER_MAP.keys())}"
        )

    spider_path = SPIDER_MAP[spider_name]
    backend_dir = _resolve_backend_dir()
    scraping_dir = _resolve_scraping_dir()
    runner = os.path.join(os.path.dirname(__file__), "runner.py")

    logger.info("Iniciando spider", spider=spider_name, path=spider_path)

    env = os.environ.copy()
    env.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

    proc = subprocess.Popen(
        [sys.executable, runner, spider_path, scraping_dir, backend_dir],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
    )
    try:
        stdout, _ = proc.communicate(timeout=3600)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.communicate()
        raise RuntimeError(f"Spider '{spider_name}' timeout tras 3600s")

    if proc.returncode != 0:
        output = stdout.decode(errors="replace")[-2000:]
        error_msg = f"Spider '{spider_name}' termino con codigo {proc.returncode}"
        logger.error("Spider fallo", spider=spider_name, exit_code=proc.returncode, output=output)
        raise self.retry(exc=RuntimeError(error_msg))

    logger.info("Spider completado exitosamente", spider=spider_name)
    return {"status": "ok", "spider": spider_name}
