from rest_framework import serializers
from .models import Vehiculo, DeteccionPlaca, PuntoAcceso, RegistroAcceso, AlertaPanico, RegistroSeguridad
from .models import DeteccionRostro

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = "__all__"
        ref_name = "SeguridadVehiculoSerializer"

class DeteccionPlacaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeteccionPlaca
        fields = "__all__"

class PuntoAccesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PuntoAcceso
        fields = "__all__"

class RegistroAccesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAcceso
        fields = "__all__"

class AlertaPanicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaPanico
        fields = "__all__"

class RegistroSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroSeguridad
        fields = "__all__"

class DeteccionRostroSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeteccionRostro
        fields = "__all__"