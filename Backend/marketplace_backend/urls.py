from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from health_reports.views import MedicalReportViewSet

router = DefaultRouter()
router.register(r"medical-reports", MedicalReportViewSet, basename="medical-report")

urlpatterns = [
    path("", RedirectView.as_view(url="/api/medical-reports/")),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]