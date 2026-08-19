from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TerminationDocumentViewSet, TerminationReasonViewSet, TerminationRequestViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r"reasons", TerminationReasonViewSet, basename="termination-reason")
router.register(r"requests", TerminationRequestViewSet, basename="termination-request")
router.register(r"documents", TerminationDocumentViewSet, basename="termination-document")

app_name = "termination"

urlpatterns = [
    path("", include(router.urls)),
]
