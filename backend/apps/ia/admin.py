from django.contrib import admin
from .models import ProgramacionRecurrente, PrediccionIA, Agregado

@admin.register(ProgramacionRecurrente)
class ProgramacionRecurrenteAdmin(admin.ModelAdmin):
    list_display = ("unidad", "descripcion", "monto", "cron", "siguiente_ejecucion")

@admin.register(PrediccionIA)
class PrediccionIAAdmin(admin.ModelAdmin):
    list_display = ("tipo", "unidad", "version_modelo", "created_at")

@admin.register(Agregado)
class AgregadoAdmin(admin.ModelAdmin):
    list_display = ("clave", "condominio", "periodo_inicio", "periodo_fin")

