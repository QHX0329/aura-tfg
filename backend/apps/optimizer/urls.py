"""URLs del modulo optimizer."""

from django.urls import path

from .views import OptimizeSemanticChoiceView, OptimizeView

urlpatterns = [
    path("", OptimizeView.as_view(), name="optimize"),
    path("choices/", OptimizeSemanticChoiceView.as_view(), name="optimize-semantic-choice"),
]
