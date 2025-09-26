# apps/finanzas/admin.py
from django.contrib import admin
from .models import Factura, Cargo, Pago, EnlacePago

@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ("numero_factura", "unidad", "monto", "fecha_vencimiento", "estado")
    search_fields = ("numero_factura", "unidad__numero_unidad")
    list_filter = ("estado", "fecha_vencimiento")

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ("descripcion", "monto", "factura")
    search_fields = ("descripcion",)

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ("unidad", "usuario", "monto", "estado", "metodo", "pagado_en")
    search_fields = ("usuario__username", "unidad__numero_unidad")
    list_filter = ("estado", "metodo")

@admin.register(EnlacePago)
class EnlacePagoAdmin(admin.ModelAdmin):
    list_display = ("enlace", "condominio", "unidad", "monto", "estado", "expira_en")
    search_fields = ("enlace",)
    list_filter = ("estado",)
