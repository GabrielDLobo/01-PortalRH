from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DepartmentViewSet,
    EmployeeDocumentViewSet,
    EmployeeViewSet,
)

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"documents", EmployeeDocumentViewSet, basename="employee-document")

urlpatterns = [
    path("", include(router.urls)),
]
