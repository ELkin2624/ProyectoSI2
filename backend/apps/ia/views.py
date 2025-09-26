from rest_framework import viewsets, permissions
from .models import ProgramacionRecurrente, PrediccionIA, Agregado
from .serializers import ProgramacionRecurrenteSerializer, PrediccionIASerializer, AgregadoSerializer

class ProgramacionRecurrenteViewSet(viewsets.ModelViewSet):
    queryset = ProgramacionRecurrente.objects.all()
    serializer_class = ProgramacionRecurrenteSerializer
    permission_classes = [permissions.IsAuthenticated]

class PrediccionIAViewSet(viewsets.ModelViewSet):
    queryset = PrediccionIA.objects.all()
    serializer_class = PrediccionIASerializer
    permission_classes = [permissions.IsAuthenticated]

class AgregadoViewSet(viewsets.ModelViewSet):
    queryset = Agregado.objects.all()
    serializer_class = AgregadoSerializer
    permission_classes = [permissions.IsAuthenticated]
