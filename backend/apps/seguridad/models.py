from django.conf import settings
from django.db import models
from apps.core.models import BaseModel
from apps.facilidades.models import Condominio, Unidad
from apps.users.models import Vehiculo

# --- Vehículos ---
"""class Vehiculo(BaseModel):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vehiculos")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="vehiculos")
    placa = models.CharField(max_length=20, unique=True)
    marca = models.CharField(max_length=50, null=True, blank=True)
    modelo = models.CharField(max_length=50, null=True, blank=True)
    color = models.CharField(max_length=30, null=True, blank=True)
    foto_url = models.TextField(null=True, blank=True)
    ref_name = "vehiculos_seguridad"

    class Meta:
        db_table = "vehiculos"
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"

    def __str__(self):
        return f"{self.placa} ({self.usuario.username})"
"""

# --- Detecciones de Placas ---
class DeteccionPlaca(BaseModel):
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.SET_NULL, null=True, blank=True, related_name="detecciones")
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="detecciones_placas")
    placa_detectada = models.CharField(max_length=20)
    camara_id = models.UUIDField()
    capturado_en = models.DateTimeField()
    imagen_url = models.TextField(null=True, blank=True)
    confianza = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "detecciones_placas"
        verbose_name = "Detección de Placa"
        verbose_name_plural = "Detecciones de Placas"


# --- Puntos de Acceso ---
class PuntoAcceso(BaseModel):
    nombre = models.CharField(max_length=100)
    ubicacion = models.JSONField(default=dict, blank=True)
    tipo = models.CharField(max_length=50, null=True, blank=True)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "puntos_acceso"
        verbose_name = "Punto de Acceso"
        verbose_name_plural = "Puntos de Acceso"

    def __str__(self):
        return self.nombre


# --- Registros de Acceso ---
class RegistroAcceso(BaseModel):
    punto_acceso = models.ForeignKey(PuntoAcceso, on_delete=models.CASCADE, related_name="registros")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="registros_acceso")
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.SET_NULL, null=True, blank=True, related_name="registros_acceso")
    tipo_evento = models.CharField(max_length=30, choices=[("entrada", "Entrada"), ("salida", "Salida"), ("denegado", "Denegado")])
    ocurrido_en = models.DateTimeField()
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "registros_acceso"
        verbose_name = "Registro de Acceso"
        verbose_name_plural = "Registros de Acceso"


# --- Alertas de Pánico ---
class AlertaPanico(BaseModel):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alertas_panico")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="alertas_panico")
    ubicacion = models.JSONField(default=dict, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=30, default="activo")  # activo, atendido, cerrado
    servicios_notificados = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "alertas_panico"
        verbose_name = "Alerta de Pánico"
        verbose_name_plural = "Alertas de Pánico"


# --- Registros de Seguridad (turnos) ---
class RegistroSeguridad(BaseModel):
    guardia = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="registros_seguridad")
    inicio_turno = models.DateTimeField()
    fin_turno = models.DateTimeField(null=True, blank=True)
    notas = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "registros_seguridad"
        verbose_name = "Registro de Seguridad"
        verbose_name_plural = "Registros de Seguridad"

# --- Detecciones de Rostros ---
class DeteccionRostro(BaseModel):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="detecciones_rostro"
    )
    condominio = models.ForeignKey(
        Condominio,
        on_delete=models.CASCADE,
        related_name="detecciones_rostros"
    )
    rostro_id = models.UUIDField(null=True, blank=True, help_text="Identificador único del rostro detectado")
    imagen_url = models.TextField(null=True, blank=True)
    confianza = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="Embeddings u otros datos del modelo")

    class Meta:
        db_table = "detecciones_rostros"
        verbose_name = "Detección de Rostro"
        verbose_name_plural = "Detecciones de Rostros"

    def __str__(self):
        return f"Rostro detectado en {self.condominio.nombre} (confianza {self.confianza}%)"
