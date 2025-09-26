from rest_framework import viewsets, permissions
from .models import Instalacion, Reserva, Indisponibilidad
from .serializers import InstalacionSerializer, ReservaSerializer, IndisponibilidadSerializer

class InstalacionViewSet(viewsets.ModelViewSet):
    queryset = Instalacion.objects.all()
    serializer_class = InstalacionSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]


class IndisponibilidadViewSet(viewsets.ModelViewSet):
    queryset = Indisponibilidad.objects.all()
    serializer_class = IndisponibilidadSerializer
    permission_classes = [permissions.IsAuthenticated]
