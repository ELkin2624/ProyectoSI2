# apps/facilidades/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Condominio, Unidad, ResidentesUnidad, Instalacion, Reserva,
    IndisponibilidadInstalacion, Incidencia, ComentarioIncidencia, Adjunto
)
from .serializers import (
    CondominioSerializer, UnidadSerializer, ResidentesUnidadSerializer,
    InstalacionSerializer, ReservaSerializer, IndisponibilidadInstalacionSerializer,
    IncidenciaSerializer, ComentarioIncidenciaSerializer, AdjuntoSerializer
)

class CondominioViewSet(viewsets.ModelViewSet):
    queryset = Condominio.objects.all().order_by('nombre')
    serializer_class = CondominioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'ciudad']

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.select_related('condominio', 'propietario_user', 'ocupante_actual_user').all()
    serializer_class = UnidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['condominio', 'tipo', 'estado']
    search_fields = ['numero_unidad', 'condominio']

class ResidentesUnidadViewSet(viewsets.ModelViewSet):
    queryset = ResidentesUnidad.objects.select_related('unidad__condominio', 'usuario').all()
    serializer_class = ResidentesUnidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['unidad', 'usuario', 'rol']

class InstalacionViewSet(viewsets.ModelViewSet):
    queryset = Instalacion.objects.select_related('condominio').all()
    serializer_class = InstalacionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['nombre']

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.select_related('instalacion', 'unidad', 'usuario').all()
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['instalacion', 'estado', 'usuario']

    # Puedes añadir acciones custom, por ejemplo para cancelar:
    # @action(detail=True, methods=['post'])
    # def cancelar(self, request, pk=None): ...

class IndisponibilidadInstalacionViewSet(viewsets.ModelViewSet):
    queryset = IndisponibilidadInstalacion.objects.select_related('instalacion').all()
    serializer_class = IndisponibilidadInstalacionSerializer
    permission_classes = [IsAuthenticated]

class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.select_related('condominio', 'reportado_por', 'asignado_a').all()
    serializer_class = IncidenciaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['condominio', 'estado', 'asignado_a']
    search_fields = ['titulo', 'descripcion']

class ComentarioIncidenciaViewSet(viewsets.ModelViewSet):
    queryset = ComentarioIncidencia.objects.select_related('incidencia', 'usuario').all()
    serializer_class = ComentarioIncidenciaSerializer
    permission_classes = [IsAuthenticated]

class AdjuntoViewSet(viewsets.ModelViewSet):
    queryset = Adjunto.objects.select_related('subido_por').all()
    serializer_class = AdjuntoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['owner_type', 'owner_id']
