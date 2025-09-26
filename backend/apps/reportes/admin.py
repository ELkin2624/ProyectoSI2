from django.contrib import admin
from .models import ReporteMorosidad

@admin.register(ReporteMorosidad)
class ReporteMorosidadAdmin(admin.ModelAdmin):
    list_display = ("condominio", "generado_en")

