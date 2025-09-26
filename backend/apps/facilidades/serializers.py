# apps/facilidades/serializers.py
from rest_framework import serializers
from .models import (
    Condominio, Unidad, ResidentesUnidad, Instalacion, Reserva,
    IndisponibilidadInstalacion, Incidencia, ComentarioIncidencia, Adjunto
)

class CondominioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condominio
        fields = '__all__'

class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'

class ResidentesUnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentesUnidad
        fields = '__all__'
        ref_name = "ResidentesUnidadFacilidadesSerializer"

class InstalacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instalacion
        fields = '__all__'

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'

class IndisponibilidadInstalacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndisponibilidadInstalacion
        fields = '__all__'

class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = '__all__'

class ComentarioIncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComentarioIncidencia
        fields = '__all__'

class AdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adjunto
        fields = '__all__'
