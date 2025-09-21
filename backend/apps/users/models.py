from django.db import models

class Usuario(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=20)
    estado = models.CharField(max_length=20, default="activo")
    nombres = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    telefono = models.CharField(max_length=8, blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "usuarios"   # nombre de tu tabla en la BD
        managed = False         # ⚠️ No permitir a Django crear/migrar esta tabla

    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.email})"
