# apps/finanzas/models.py
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.facilidades.models import Condominio, Unidad

class Factura(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="facturas")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="facturas")
    numero_factura = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=30, default="pendiente")  # pendiente, pagada, vencida
    emitida_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "facturas"
        ordering = ["-emitida_en"]

    def __str__(self):
        return f"Factura {self.numero_factura} - {self.unidad}"


class Cargo(BaseModel):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name="cargos")
    descripcion = models.TextField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "cargos"

    def __str__(self):
        return f"Cargo {self.descripcion} - {self.monto}"


class Pago(BaseModel):
    factura = models.ForeignKey(Factura, on_delete=models.SET_NULL, null=True, blank=True, related_name="pagos")
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name="pagos")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="pagos")
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    pagado_en = models.DateTimeField(auto_now_add=True)
    metodo = models.CharField(max_length=30, default="cash")  # card, bank_transfer, cash, link
    proveedor_pasarela = models.CharField(max_length=50, blank=True, null=True)
    payload_pasarela = models.JSONField(default=dict, blank=True)
    estado = models.CharField(max_length=30, default="processing")  # processing, success, failed
    url_comprobante = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "pagos"

    def __str__(self):
        return f"Pago {self.monto} - {self.usuario}"


class EnlacePago(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="enlaces_pago")
    unidad = models.ForeignKey(Unidad, on_delete=models.SET_NULL, null=True, blank=True, related_name="enlaces_pago")
    enlace = models.TextField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    expira_en = models.DateTimeField()
    limite_uso = models.IntegerField(default=1)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="enlaces_creados")
    sesion_pasarela = models.JSONField(default=dict, blank=True)
    estado = models.CharField(max_length=30, default="activo")

    class Meta:
        db_table = "enlaces_pago"

    def __str__(self):
        return f"Enlace {self.enlace} - {self.monto}"
