# apps/facilidades/admin.py
from django.contrib import admin
from .models import (
    Condominio, Unidad, ResidentesUnidad, Instalacion, Reserva,
    IndisponibilidadInstalacion, Incidencia, ComentarioIncidencia, Adjunto
)

@admin.register(Condominio)
class CondominioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'ciudad', 'pais', 'moneda')
    search_fields = ('nombre', 'ciudad')

@admin.register(Unidad)
class UnidadAdmin(admin.ModelAdmin):
    list_display = ('numero_unidad', 'condominio', 'tipo', 'estado', 'propietario_user')
    search_fields = ('numero_unidad',)
    list_filter = ('tipo', 'estado')

@admin.register(ResidentesUnidad)
class ResidentesUnidadAdmin(admin.ModelAdmin):
    list_display = ('unidad', 'usuario', 'rol', 'es_principal')
    search_fields = ('unidad__numero_unidad', 'usuario__username')

@admin.register(Instalacion)
class InstalacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'condominio', 'capacidad')
    search_fields = ('nombre',)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('instalacion', 'inicio', 'fin', 'estado', 'unidad', 'usuario')
    list_filter = ('estado',)
    search_fields = ('instalacion__nombre', 'unidad__numero_unidad')

@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'condominio', 'estado', 'prioridad', 'reportado_por')
    list_filter = ('estado','prioridad')

@admin.register(ComentarioIncidencia)
class ComentarioIncidenciaAdmin(admin.ModelAdmin):
    list_display = ('incidencia', 'usuario', 'created_at')

@admin.register(Adjunto)
class AdjuntoAdmin(admin.ModelAdmin):
    list_display = ('url', 'owner_type', 'subido_por', 'created_at')
