from django.db import models
from apps.core.models import BaseModel
from apps.facilidades.models import Condominio, Unidad
from apps.finanzas.models import Factura, Pago

class ReporteMorosidad(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="reportes_morosidad")
    generado_en = models.DateTimeField(auto_now_add=True)
    datos = models.JSONField(default=dict, blank=True, help_text="Lista de residentes con pagos pendientes")

    class Meta:
        db_table = "reportes_morosidad"
        verbose_name = "Reporte de Morosidad"
        verbose_name_plural = "Reportes de Morosidad"

    def __str__(self):
        return f"Morosidad {self.condominio.nombre} - {self.generado_en.date()}"
