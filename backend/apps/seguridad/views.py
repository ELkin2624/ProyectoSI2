from rest_framework import viewsets, permissions
from .models import Vehiculo, DeteccionPlaca, PuntoAcceso, RegistroAcceso, AlertaPanico, RegistroSeguridad, DeteccionRostro
from .serializers import (
    VehiculoSerializer, DeteccionPlacaSerializer, PuntoAccesoSerializer,
    RegistroAccesoSerializer, AlertaPanicoSerializer, RegistroSeguridadSerializer,
    DeteccionRostroSerializer
)

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

class DeteccionPlacaViewSet(viewsets.ModelViewSet):
    queryset = DeteccionPlaca.objects.all()
    serializer_class = DeteccionPlacaSerializer
    permission_classes = [permissions.IsAuthenticated]

class PuntoAccesoViewSet(viewsets.ModelViewSet):
    queryset = PuntoAcceso.objects.all()
    serializer_class = PuntoAccesoSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegistroAccesoViewSet(viewsets.ModelViewSet):
    queryset = RegistroAcceso.objects.all()
    serializer_class = RegistroAccesoSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlertaPanicoViewSet(viewsets.ModelViewSet):
    queryset = AlertaPanico.objects.all()
    serializer_class = AlertaPanicoSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegistroSeguridadViewSet(viewsets.ModelViewSet):
    queryset = RegistroSeguridad.objects.all()
    serializer_class = RegistroSeguridadSerializer
    permission_classes = [permissions.IsAuthenticated]

class DeteccionRostroViewSet(viewsets.ModelViewSet):
    queryset = DeteccionRostro.objects.all()
    serializer_class = DeteccionRostroSerializer
    permission_classes = [permissions.IsAuthenticated]

