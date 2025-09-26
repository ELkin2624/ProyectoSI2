from django.contrib import admin
from .models import Anuncio, Conversacion, Mensaje, Notificacion

@admin.register(Anuncio)
class AnuncioAdmin(admin.ModelAdmin):
    list_display = ("titulo", "condominio", "publicado_en", "expira_en")

@admin.register(Conversacion)
class ConversacionAdmin(admin.ModelAdmin):
    list_display = ("asunto", "ultima_fecha_mensaje")

@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ("conversacion", "remitente", "receptor", "contenido", "created_at")

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ("usuario", "tipo", "canal", "enviado_en", "leido_en")

