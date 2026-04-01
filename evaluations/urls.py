from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EvaluationTemplateViewSet,
    EvaluationViewSet,
    EvaluationScoreViewSet,
    EvaluationCycleViewSet,
)

router = DefaultRouter()
router.register(r'templates', EvaluationTemplateViewSet, basename='evaluation-template')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'scores', EvaluationScoreViewSet, basename='evaluation-score')
router.register(r'cycles', EvaluationCycleViewSet, basename='evaluation-cycle')

urlpatterns = [
    path('', include(router.urls)),
]