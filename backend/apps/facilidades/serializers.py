# apps/facilidades/serializers.py
from rest_framework import serializers
from .models import (
    Condominio, Unidad, ResidentesUnidad, Instalacion, Reserva,
    IndisponibilidadInstalacion, Incidencia, ComentarioIncidencia, Adjunto
)
from django.contrib.auth import get_user_model

User = get_user_model()

class CondominioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condominio
        fields = '__all__'

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username')

class UnidadSerializer(serializers.ModelSerializer):
    condominio = serializers.PrimaryKeyRelatedField(queryset=Condominio.objects.all())
    condominio_obj = CondominioSerializer(source='condominio', read_only=True)

    propietario_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), allow_null=True, required=False
    )
    propietario_user_obj = UserListSerializer(source='propietario_user', read_only=True)

    ocupante_actual_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), allow_null=True, required=False
    )
    ocupante_actual_user_obj = UserListSerializer(source='ocupante_actual_user', read_only=True)

    class Meta:
        model = Unidad
        fields = [
            'id', 'condominio', 'condominio_obj',
            'numero_unidad', 'piso', 'area_m2',
            'tipo', 'estado',
            'propietario_user', 'propietario_user_obj',
            'ocupante_actual_user', 'ocupante_actual_user_obj',
            # si tienes otros campos en BaseModel (created_by, timestamps) ponlos también
        ]

class ResidentesUnidadSerializer(serializers.ModelSerializer):
    unidad = serializers.PrimaryKeyRelatedField(queryset=Unidad.objects.all())
    unidad_obj = UnidadSerializer(source="unidad", read_only=True)

    usuario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    usuario_obj = UserListSerializer(source="usuario", read_only=True)

    class Meta:
        model = ResidentesUnidad
        fields = [
            "id", "rol", "desde", "hasta", "es_principal",
            "unidad", "unidad_obj",
            "usuario", "usuario_obj",
        ]
        ref_name = "ResidentesUnidadFacilidadesSerializer"

class InstalacionSerializer(serializers.ModelSerializer):
    condominio = serializers.PrimaryKeyRelatedField(queryset=Condominio.objects.all())
    condominio_obj = CondominioSerializer(source="condominio", read_only=True)

    class Meta:
        model = Instalacion
        fields = [
            "id", "nombre", "capacidad", "ventana_reserva_dias",
            "condominio", "condominio_obj",
        ]

class ReservaSerializer(serializers.ModelSerializer):
    instalacion = serializers.PrimaryKeyRelatedField(queryset=Instalacion.objects.all())
    instalacion_obj = InstalacionSerializer(source="instalacion", read_only=True)

    unidad = serializers.PrimaryKeyRelatedField(queryset=Unidad.objects.all(), allow_null=True)
    unidad_obj = UnidadSerializer(source="unidad", read_only=True)

    usuario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    usuario_obj = UserListSerializer(source="usuario", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id", "inicio", "fin", "estado", "invitados", "pase_qr", "metadata",
            "instalacion", "instalacion_obj",
            "unidad", "unidad_obj",
            "usuario", "usuario_obj",
        ]

class IndisponibilidadInstalacionSerializer(serializers.ModelSerializer):
    instalacion = serializers.PrimaryKeyRelatedField(queryset=Instalacion.objects.all())
    instalacion_obj = InstalacionSerializer(source="instalacion", read_only=True)

    class Meta:
        model = IndisponibilidadInstalacion
        fields = ["id", "inicio", "fin", "motivo", "instalacion", "instalacion_obj"]

class IncidenciaSerializer(serializers.ModelSerializer):
    unidad = serializers.PrimaryKeyRelatedField(queryset=Unidad.objects.all(), allow_null=True, required=False)
    unidad_obj = UnidadSerializer(source="unidad", read_only=True)

    condominio = serializers.PrimaryKeyRelatedField(queryset=Condominio.objects.all())
    condominio_obj = CondominioSerializer(source="condominio", read_only=True)

    reportado_por = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    reportado_por_obj = UserListSerializer(source="reportado_por", read_only=True)

    asignado_a = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True, required=False)
    asignado_a_obj = UserListSerializer(source="asignado_a", read_only=True)

    class Meta:
        model = Incidencia
        fields = [
            "id", "categoria", "titulo", "descripcion", "reportado_en",
            "estado", "prioridad", "ubicacion", "urls_audio", "urls_imagen",
            "unidad", "unidad_obj",
            "condominio", "condominio_obj",
            "reportado_por", "reportado_por_obj",
            "asignado_a", "asignado_a_obj",
        ]

class ComentarioIncidenciaSerializer(serializers.ModelSerializer):
    incidencia = serializers.PrimaryKeyRelatedField(queryset=Incidencia.objects.all())
    incidencia_obj = IncidenciaSerializer(source="incidencia", read_only=True)

    usuario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    usuario_obj = UserListSerializer(source="usuario", read_only=True)

    class Meta:
        model = ComentarioIncidencia
        fields = [
            "id", "comentario", "adjuntos", "incidencia", "incidencia_obj",
            "usuario", "usuario_obj",
        ]

class AdjuntoSerializer(serializers.ModelSerializer):
    subido_por = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    subido_por_obj = UserListSerializer(source="subido_por", read_only=True)

    class Meta:
        model = Adjunto
        fields = [
            "id", "owner_type", "owner_id", "url", "mime", "tamanio",
            "subido_por", "subido_por_obj",
        ]
