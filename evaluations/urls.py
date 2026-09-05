from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import (
    EvaluationCycleViewSet,
    EvaluationScoreViewSet,
    EvaluationTemplateViewSet,
    EvaluationViewSet,
)

router = DefaultRouter()
router.register(r"templates", EvaluationTemplateViewSet, basename="evaluation-template")
router.register(r"evaluations", EvaluationViewSet, basename="evaluation")
# Rota plana: leitura/filtragem de notas (ex.: ?avaliacao=<id>) para quem já
# sabe o id da avaliação sem precisar da rota aninhada abaixo.
router.register(r"scores", EvaluationScoreViewSet, basename="evaluation-score")
router.register(r"cycles", EvaluationCycleViewSet, basename="evaluation-cycle")

# Rota aninhada: EvaluationScoreCreateSerializer.create() exige
# context["evaluation"], que o viewset só popula a partir do evaluation_pk
# da URL (mesmo padrão usado em employees/urls.py para documents).
evaluations_router = NestedDefaultRouter(router, r"evaluations", lookup="evaluation")
evaluations_router.register(r"scores", EvaluationScoreViewSet, basename="evaluation-nested-scores")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(evaluations_router.urls)),
]
