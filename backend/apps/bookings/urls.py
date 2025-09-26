from rest_framework import routers
from django.urls import path, include
from .views import InstalacionViewSet, ReservaViewSet, IndisponibilidadViewSet

router = routers.DefaultRouter()
router.register(r'instalaciones', InstalacionViewSet)
router.register(r'reservas', ReservaViewSet)
router.register(r'indisponibilidades', IndisponibilidadViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
