from django.db import models
from apps.core.models import BaseModel
from django.contrib.auth.models import User
from apps.facilidades.models import Unidad, ResidentesUnidad

import uuid
from django.conf import settings

class Profile(models.Model):
    """Modelo para almacenar información adicional del usuario."""
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
        ('residente', 'Residente'),
        ('junta', 'Junta Directiva'),
        ('guardia', 'Guardia'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="residente")
    phone = models.CharField(max_length=20, blank=True, null=True)  # campo extra de ejemplo

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    @property
    def group_name(self):
        """Devuelve el nombre del grupo correspondiente al rol."""
        mapping = {
            'admin': 'Admin',
            'empleado': 'Empleado',
            'residente': 'Residente',
            'junta': 'JuntaDirectiva',
            'guardia': 'Guardia',
        }
        return mapping.get(self.role, 'Residente')
    
    
class Vehiculo(BaseModel):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vehiculos")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="vehiculos")
    placa = models.CharField(max_length=20, unique=True)
    marca = models.CharField(max_length=50, blank=True, null=True)
    modelo = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    foto_url = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "vehiculos"
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"

    def __str__(self):
        return f"{self.placa} - {self.usuario.username}"