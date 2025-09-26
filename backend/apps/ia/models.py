from django.db import models
from apps.core.models import BaseModel
from apps.facilidades.models import Unidad, Condominio
from django.contrib.auth.models import User
from apps.users.models import Vehiculo

# Create your models here.
class PrediccionMorosidad(models.Model):
    residente = models.ForeignKey(User, on_delete=models.CASCADE)
    probabilidad_mora = models.FloatField()
    fecha_prediccion = models.DateTimeField(auto_now_add=True)

class RegistroReconocimiento(models.Model):
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50, choices=[('placa','Placa'), ('rostro','Rostro')])
    resultado = models.BooleanField()
    fecha = models.DateTimeField(auto_now_add=True)

class ChatbotConsulta(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    pregunta = models.TextField()
    respuesta = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

class ProgramacionRecurrente(BaseModel):
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="programaciones_recurrentes")
    descripcion = models.TextField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    cron = models.CharField(max_length=100, help_text="Expresión cron para ejecución")
    siguiente_ejecucion = models.DateTimeField()

    class Meta:
        db_table = "programaciones_recurrentes"
        verbose_name = "Programación Recurrente"
        verbose_name_plural = "Programaciones Recurrentes"

    def __str__(self):
        return f"{self.descripcion} - {self.unidad}"


class PrediccionIA(BaseModel):
    TIPOS = [
        ("morosidad", "Morosidad"),
        ("consumo", "Consumo"),
        ("anomaly", "Anomalía"),
    ]
    tipo = models.CharField(max_length=30, choices=TIPOS)
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="predicciones_ia")
    payload = models.JSONField(default=dict, blank=True)
    version_modelo = models.CharField(max_length=50, default="v1")

    class Meta:
        db_table = "predicciones_ia"
        verbose_name = "Predicción IA"
        verbose_name_plural = "Predicciones IA"


class Agregado(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="agregados")
    clave = models.CharField(max_length=50)
    valor = models.JSONField(default=dict, blank=True)
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()

    class Meta:
        db_table = "agregados"
        verbose_name = "Agregado"
        verbose_name_plural = "Agregados"

    def __str__(self):
        return f"{self.clave} ({self.periodo_inicio} - {self.periodo_fin})"