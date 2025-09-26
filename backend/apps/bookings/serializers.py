from rest_framework import serializers
from .models import Instalacion, Reserva, Indisponibilidad

class InstalacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instalacion
        fields = '__all__'
        ref_name = 'BookingsInstalacionSerializer'


class ReservaSerializer(serializers.ModelSerializer):
    residente_username = serializers.CharField(source="residente.username", read_only=True)
    instalacion_nombre = serializers.CharField(source="instalacion.nombre", read_only=True)

    class Meta:
        model = Reserva
        fields = '__all__'
        ref_name = 'BookingsReservaSerializer'


class IndisponibilidadSerializer(serializers.ModelSerializer):
    instalacion_nombre = serializers.CharField(source="instalacion.nombre", read_only=True)

    class Meta:
        model = Indisponibilidad
        fields = '__all__'
