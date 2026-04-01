from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import EmployeeViewSet, EmployeeDocumentViewSet, AdmissionProcessViewSet, PreAdmissionRHViewSet

# Create main router
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'admission-processes', AdmissionProcessViewSet)
router.register(r'pre-admissions', PreAdmissionRHViewSet)

# Create nested router for employee documents
employees_router = NestedDefaultRouter(router, r'employees', lookup='employee')
employees_router.register(r'documents', EmployeeDocumentViewSet, basename='employee-documents')

# Additional standalone document endpoints
router.register(r'documents', EmployeeDocumentViewSet, basename='documents')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(employees_router.urls)),
]