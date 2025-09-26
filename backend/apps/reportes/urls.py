from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteMorosidadViewSet, ReportesGeneralesView

router = DefaultRouter()
router.register(r"morosidad", ReporteMorosidadViewSet)
#router.register(r"generales", ReportesGeneralesView, basename="reportes-generales")

urlpatterns = [
    path("", include(router.urls)),
    path("general/", ReportesGeneralesView.as_view(), name="reporte-general"),
]
