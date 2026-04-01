from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TerminationReasonViewSet,
    TerminationRequestViewSet,
    TerminationDocumentViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'reasons', TerminationReasonViewSet, basename='termination-reason')
router.register(r'requests', TerminationRequestViewSet, basename='termination-request')
router.register(r'documents', TerminationDocumentViewSet, basename='termination-document')

app_name = 'termination'

urlpatterns = [
    path('', include(router.urls)),
]