# apps/finanzas/serializers.py
from rest_framework import serializers
from .models import Factura, Cargo, Pago, EnlacePago

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = "__all__"

class FacturaSerializer(serializers.ModelSerializer):
    cargos = CargoSerializer(many=True, read_only=True)

    class Meta:
        model = Factura
        fields = "__all__"

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"

class EnlacePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnlacePago
        fields = "__all__"

