from rest_framework import serializers
from .models import ReporteMorosidad

class ReporteMorosidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteMorosidad
        fields = "__all__"
