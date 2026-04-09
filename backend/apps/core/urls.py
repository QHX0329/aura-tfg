"""URLs del módulo core."""

from django.urls import path

from .views import health_check

urlpatterns = [
    path("", health_check, name="health-check"),
    path("health/", health_check, name="health-check-legacy"),
]
