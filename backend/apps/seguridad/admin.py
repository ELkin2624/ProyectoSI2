from django.contrib import admin
from .models import ( DeteccionPlaca, PuntoAcceso, RegistroAcceso, 
    AlertaPanico, RegistroSeguridad, DeteccionRostro
)

@admin.register(DeteccionPlaca)
class DeteccionPlacaAdmin(admin.ModelAdmin):
    list_display = ("placa_detectada", "condominio", "capturado_en", "confianza")

@admin.register(PuntoAcceso)
class PuntoAccesoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "tipo")

@admin.register(RegistroAcceso)
class RegistroAccesoAdmin(admin.ModelAdmin):
    list_display = ("punto_acceso", "usuario", "vehiculo", "tipo_evento", "ocurrido_en")

@admin.register(AlertaPanico)
class AlertaPanicoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "unidad", "estado", "creado_en")

@admin.register(RegistroSeguridad)
class RegistroSeguridadAdmin(admin.ModelAdmin):
    list_display = ("guardia", "inicio_turno", "fin_turno")

@admin.register(DeteccionRostro)
class DeteccionRostroAdmin(admin.ModelAdmin):
    list_display = ("usuario", "condominio", "confianza", "created_at")