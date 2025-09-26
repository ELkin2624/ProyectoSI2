from django.db import models
from apps.core.models import BaseModel
from django.conf import settings
from apps.facilidades.models import Unidad

class Instalacion(BaseModel):
    """Áreas comunes del condominio (piscina, salón, etc.)."""
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    capacidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.nombre


class Reserva(BaseModel):
    """Reserva hecha por un residente para una instalación."""
    residente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservas_booking")
    instalacion = models.ForeignKey(Instalacion, on_delete=models.CASCADE, related_name="reservas_booking")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="reservas_booking", null=True, blank=True)  # ✅ usando Unidad
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=[
        ("pendiente", "Pendiente"),
        ("aprobada", "Aprobada"),
        ("rechazada", "Rechazada"),
        ("cancelada", "Cancelada"),
    ], default="pendiente")

    def __str__(self):
        return f"{self.instalacion.nombre} - {self.residente.username} ({self.fecha_inicio.date()})"


class Indisponibilidad(BaseModel):
    """Bloqueo de uso de una instalación (mantenimiento, evento especial)."""
    instalacion = models.ForeignKey(Instalacion, on_delete=models.CASCADE, related_name="indisponibilidades")
    motivo = models.CharField(max_length=255)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()

    def __str__(self):
        return f"{self.instalacion.nombre} no disponible ({self.fecha_inicio.date()} - {self.fecha_fin.date()})"