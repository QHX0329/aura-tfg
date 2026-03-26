"""Runner standalone para spiders de Scrapy.

Se invoca como proceso hijo via subprocess desde la tarea Celery run_spider,
evitando la restriccion de procesos daemonicos de multiprocessing.

Uso:
    python runner.py <spider_dotted_path> <scraping_dir> <backend_dir>
"""

import importlib
import os
import sys


def main() -> None:
    spider_cls_path, scraping_dir, backend_dir = sys.argv[1], sys.argv[2], sys.argv[3]

    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    if scraping_dir not in sys.path:
        sys.path.insert(0, scraping_dir)
    os.chdir(scraping_dir)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    import django

    django.setup()

    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings

    settings = get_project_settings()
    process = CrawlerProcess(settings)

    module_path, class_name = spider_cls_path.rsplit(".", 1)
    module = importlib.import_module(module_path)
    spider_cls = getattr(module, class_name)

    process.crawl(spider_cls)
    process.start()


if __name__ == "__main__":
    main()
