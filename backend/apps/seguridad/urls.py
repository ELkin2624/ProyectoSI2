from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehiculoViewSet, DeteccionPlacaViewSet, PuntoAccesoViewSet,
    RegistroAccesoViewSet, AlertaPanicoViewSet, RegistroSeguridadViewSet,
    DeteccionRostroViewSet
)

router = DefaultRouter()
router.register(r"vehiculos", VehiculoViewSet)
router.register(r"detecciones-placas", DeteccionPlacaViewSet)
router.register(r"puntos-acceso", PuntoAccesoViewSet)
router.register(r"registros-acceso", RegistroAccesoViewSet)
router.register(r"alertas-panico", AlertaPanicoViewSet)
router.register(r"registros-seguridad", RegistroSeguridadViewSet)
router.register(r"detecciones-rostros", DeteccionRostroViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
