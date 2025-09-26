from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramacionRecurrenteViewSet, PrediccionIAViewSet, AgregadoViewSet

router = DefaultRouter()
router.register(r"programaciones", ProgramacionRecurrenteViewSet)
router.register(r"predicciones", PrediccionIAViewSet)
router.register(r"agregados", AgregadoViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
