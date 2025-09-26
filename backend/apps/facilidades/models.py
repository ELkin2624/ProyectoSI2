# apps/facilidades/models.py
from django.conf import settings
from django.db import models
from apps.core.models import BaseModel

# Choices útiles
UNIDAD_TIPOS = [
    ('departamento', 'Departamento'),
    ('local', 'Local'),
    ('cochera', 'Cochera'),
]

UNIDAD_ESTADOS = [
    ('ocupado', 'Ocupado'),
    ('vacante', 'Vacante'),
    ('en_venta', 'En venta'),
    ('mantenimiento', 'Mantenimiento'),
]

RESERVA_ESTADOS = [
    ('pendiente', 'Pendiente'),
    ('confirmada', 'Confirmada'),
    ('cancelada', 'Cancelada'),
    ('completada', 'Completada'),
]

INCIDENCIA_ESTADOS = [
    ('abierta', 'Abierta'),
    ('en_progreso', 'En progreso'),
    ('cerrada', 'Cerrada'),
]

INCIDENCIA_PRIORIDAD = [
    ('baja', 'Baja'),
    ('media', 'Media'),
    ('alta', 'Alta'),
    ('urgente', 'Urgente'),
]


class Condominio(BaseModel):
    nombre = models.TextField()
    direccion = models.TextField(null=True, blank=True)
    ciudad = models.TextField(null=True, blank=True)
    pais = models.TextField(null=True, blank=True)
    zona_horaria = models.TextField(null=True, blank=True)
    moneda = models.TextField(null=True, blank=True)
    configuracion = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "condominios"
        verbose_name = "Condominio"
        verbose_name_plural = "Condominios"

    def __str__(self):
        return self.nombre


class Unidad(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="unidades")
    numero_unidad = models.TextField()
    piso = models.IntegerField(null=True, blank=True)
    area_m2 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    tipo = models.CharField(max_length=30, choices=UNIDAD_TIPOS, default='departamento')
    estado = models.CharField(max_length=30, choices=UNIDAD_ESTADOS, default='ocupado')
    propietario_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="propiedades")
    ocupante_actual_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="ocupaciones")

    class Meta:
        db_table = "unidades"
        verbose_name = "Unidad"
        verbose_name_plural = "Unidades"
        unique_together = (('condominio', 'numero_unidad'),)

    def __str__(self):
        return f"{self.condominio.nombre} - {self.numero_unidad}"


class ResidentesUnidad(BaseModel):
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="residentes_unidad")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="residencias")
    rol = models.CharField(max_length=30, help_text="propietario|inquilino|ocupante", default='propietario')
    desde = models.DateField(null=True, blank=True)
    hasta = models.DateField(null=True, blank=True)
    es_principal = models.BooleanField(default=False)

    class Meta:
        db_table = "residentes_unidad"
        verbose_name = "Residente de unidad"
        verbose_name_plural = "Residentes por unidad"
        indexes = [models.Index(fields=["unidad", "usuario"])]


class Instalacion(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="instalaciones")
    nombre = models.TextField()
    capacidad = models.IntegerField(null=True, blank=True)
    reglas = models.JSONField(default=dict, blank=True)
    ventana_reserva_dias = models.IntegerField(default=30)

    class Meta:
        db_table = "instalaciones"
        verbose_name = "Instalación"
        verbose_name_plural = "Instalaciones"

    def __str__(self):
        return f"{self.nombre} ({self.condominio.nombre})"


class Reserva(BaseModel):
    instalacion = models.ForeignKey(Instalacion, on_delete=models.CASCADE, related_name="reservas")
    unidad = models.ForeignKey(Unidad, on_delete=models.SET_NULL, null=True, blank=True, related_name="reservas")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reservas")
    inicio = models.DateTimeField()
    fin = models.DateTimeField()
    estado = models.CharField(max_length=30, choices=RESERVA_ESTADOS, default='pendiente')
    invitados = models.IntegerField(default=0)
    pase_qr = models.UUIDField(null=True, blank=True)  # referencia a pase QR (en otra app)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "reservas"
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        indexes = [models.Index(fields=["instalacion", "inicio", "fin"])]

    def __str__(self):
        return f"Reserva {self.instalacion.nombre} - {self.inicio.isoformat()}"

    def clean(self):
        # Nota: si quieres lógica de validación (ej. solapamiento) agrega clean() o valida en serializer/service.
        super().clean()


class IndisponibilidadInstalacion(BaseModel):
    instalacion = models.ForeignKey(Instalacion, on_delete=models.CASCADE, related_name="indisponibilidades")
    inicio = models.DateTimeField()
    fin = models.DateTimeField()
    motivo = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "indisponibilidad_instalacion"
        verbose_name = "Indisponibilidad de instalación"
        verbose_name_plural = "Indisponibilidades"


class Incidencia(BaseModel):
    unidad = models.ForeignKey(Unidad, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidencias")
    reportado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="incidencias_reportadas")
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="incidencias")
    categoria = models.TextField(null=True, blank=True)
    titulo = models.TextField()
    descripcion = models.TextField(null=True, blank=True)
    reportado_en = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=30, choices=INCIDENCIA_ESTADOS, default='abierta')
    prioridad = models.CharField(max_length=20, choices=INCIDENCIA_PRIORIDAD, default='media')
    ubicacion = models.JSONField(null=True, blank=True)  # {lat:..., lng:...}
    urls_audio = models.JSONField(null=True, blank=True)  # lista de urls
    urls_imagen = models.JSONField(null=True, blank=True)  # lista de urls
    asignado_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidencias_asignadas")

    class Meta:
        db_table = "incidencias"
        verbose_name = "Incidencia"
        verbose_name_plural = "Incidencias"
        indexes = [models.Index(fields=["condominio", "estado"]), models.Index(fields=["asignado_a"])]


class ComentarioIncidencia(BaseModel):
    incidencia = models.ForeignKey(Incidencia, on_delete=models.CASCADE, related_name="comentarios")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comentario = models.TextField()
    adjuntos = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "comentarios_incidencia"
        verbose_name = "Comentario de incidencia"
        verbose_name_plural = "Comentarios de incidencias"


class Adjunto(BaseModel):
    """
    Adjunto simple local. Recomiendo centralizar adjuntos en apps.core/adjuntos si prefieres.
    """
    owner_type = models.TextField(null=True, blank=True)
    owner_id = models.UUIDField(null=True, blank=True)
    url = models.TextField()
    mime = models.TextField(null=True, blank=True)
    tamanio = models.BigIntegerField(null=True, blank=True)
    subido_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = "adjuntos"
        verbose_name = "Adjunto"
        verbose_name_plural = "Adjuntos"
