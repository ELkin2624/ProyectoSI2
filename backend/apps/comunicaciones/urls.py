from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnuncioViewSet, ConversacionViewSet, MensajeViewSet, NotificacionViewSet

router = DefaultRouter()
router.register(r"anuncios", AnuncioViewSet)
router.register(r"conversaciones", ConversacionViewSet)
router.register(r"mensajes", MensajeViewSet)
router.register(r"notificaciones", NotificacionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
