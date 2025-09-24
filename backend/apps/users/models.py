from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
        ('residente', 'Residente'),
        ('junta', 'Junta Directiva'),
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
        }
        return mapping.get(self.role, 'Residente')