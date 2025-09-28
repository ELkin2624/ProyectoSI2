# apps/finanzas/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (FacturaViewSet, CargoViewSet, PagoViewSet, 
    EnlacePagoViewSet, UserSearchAPIView
)
router = DefaultRouter()
router.register(r"facturas", FacturaViewSet, basename="factura")
router.register(r"cargos", CargoViewSet, basename="cargo")
router.register(r"pagos", PagoViewSet, basename="pago")
router.register(r"enlaces-pago", EnlacePagoViewSet, basename="enlace_pago")

urlpatterns = [
    path("", include(router.urls)),
    path("users/search/", UserSearchAPIView.as_view(), name="users-search"),
]
