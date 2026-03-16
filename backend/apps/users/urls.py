"""URLs del módulo de usuarios y autenticación."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    UserProfileViewSet,
    UserRegistrationView,
)

router = DefaultRouter()
router.register("profile", UserProfileViewSet, basename="profile")

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="auth-register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="auth-token"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="auth-token-refresh"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path("", include(router.urls)),
]
