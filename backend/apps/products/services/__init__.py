"""Servicios del modulo products."""

from functools import lru_cache
from importlib import util
from pathlib import Path

_service_file = Path(__file__).resolve().parent.parent / "services.py"


@lru_cache(maxsize=1)
def _load_impl():
    spec = util.spec_from_file_location("apps.products._services_impl", _service_file)
    if spec is None or spec.loader is None:  # pragma: no cover - fallo de carga improbable.
        raise ImportError("No se pudo cargar approve_proposal desde services.py")

    module = util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def approve_proposal(proposal):
    """Delegación perezosa para evitar importar modelos antes de tiempo."""
    return _load_impl().approve_proposal(proposal)


__all__ = ["approve_proposal"]
