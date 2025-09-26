from django.contrib import admin
from .models import Instalacion, Reserva, Indisponibilidad

@admin.register(Instalacion)
class InstalacionAdmin(admin.ModelAdmin):
    list_display = ("nombre", "capacidad")
    search_fields = ("nombre",)


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ("instalacion", "residente", "fecha_inicio", "fecha_fin", "estado")
    list_filter = ("estado", "fecha_inicio", "fecha_fin")
    search_fields = ("instalacion__nombre", "residente__username")


@admin.register(Indisponibilidad)
class IndisponibilidadAdmin(admin.ModelAdmin):
    list_display = ("instalacion", "motivo", "fecha_inicio", "fecha_fin")
    list_filter = ("fecha_inicio", "fecha_fin")
