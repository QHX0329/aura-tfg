"""Configuración de desarrollo."""

from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Debug toolbar
INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405
INTERNAL_IPS = ["127.0.0.1"]

# Email en consola durante desarrollo
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Logging más verboso
LOGGING["loggers"]["apps"]["level"] = "DEBUG"  # noqa: F405
