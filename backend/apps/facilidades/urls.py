# apps/facilities/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    CondominioViewSet, UnidadViewSet, ResidentesUnidadViewSet,
    InstalacionViewSet, ReservaViewSet, IndisponibilidadInstalacionViewSet,
    IncidenciaViewSet, ComentarioIncidenciaViewSet, AdjuntoViewSet
)

router = DefaultRouter()
router.register(r'condominios', CondominioViewSet, basename='condominio')
router.register(r'unidades', UnidadViewSet, basename='unidad')
router.register(r'residentes-unidad', ResidentesUnidadViewSet, basename='residentes_unidad')
router.register(r'instalaciones', InstalacionViewSet, basename='instalacion')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'indisponibilidades', IndisponibilidadInstalacionViewSet, basename='indisponibilidad')
router.register(r'incidencias', IncidenciaViewSet, basename='incidencia')
router.register(r'comentarios-incidencia', ComentarioIncidenciaViewSet, basename='comentario_incidencia')
router.register(r'adjuntos', AdjuntoViewSet, basename='adjunto')

urlpatterns = [
    path('', include(router.urls)),
]
