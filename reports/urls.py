from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardViewSet,
    ReportBookmarkViewSet,
    ReportCategoryViewSet,
    ReportExecutionViewSet,
    ReportScheduleViewSet,
    ReportTemplateViewSet,
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r"categories", ReportCategoryViewSet, basename="reportcategory")
router.register(r"templates", ReportTemplateViewSet, basename="reporttemplate")
router.register(r"executions", ReportExecutionViewSet, basename="reportexecution")
router.register(r"schedules", ReportScheduleViewSet, basename="reportschedule")
router.register(r"bookmarks", ReportBookmarkViewSet, basename="reportbookmark")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

app_name = "reports"

urlpatterns = [
    path("reports/", include(router.urls)),
]
