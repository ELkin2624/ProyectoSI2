from rest_framework import serializers
from .models import ProgramacionRecurrente, PrediccionIA, Agregado

class ProgramacionRecurrenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramacionRecurrente
        fields = "__all__"

class PrediccionIASerializer(serializers.ModelSerializer):
    class Meta:
        model = PrediccionIA
        fields = "__all__"

class AgregadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agregado
        fields = "__all__"
