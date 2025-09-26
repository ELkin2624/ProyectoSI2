from django.conf import settings
from django.db import models
from apps.core.models import BaseModel
from apps.facilidades.models import Condominio

# --- Anuncios ---
class Anuncio(BaseModel):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name="anuncios")
    titulo = models.TextField()
    cuerpo = models.TextField()
    publicado_en = models.DateTimeField(auto_now_add=True)
    expira_en = models.DateTimeField(null=True, blank=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "anuncios"
        verbose_name = "Anuncio"
        verbose_name_plural = "Anuncios"

    def __str__(self):
        return self.titulo


# --- Conversaciones ---
class Conversacion(BaseModel):
    asunto = models.TextField()
    participantes = models.JSONField(default=list, blank=True)  # lista de IDs de usuarios
    ultima_fecha_mensaje = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "conversaciones"
        verbose_name = "Conversación"
        verbose_name_plural = "Conversaciones"

    def __str__(self):
        return self.asunto


# --- Mensajes ---
class Mensaje(BaseModel):
    conversacion = models.ForeignKey(Conversacion, on_delete=models.CASCADE, related_name="mensajes")
    remitente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mensajes_enviados")
    receptor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="mensajes_recibidos")
    contenido = models.TextField()
    adjuntos = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "mensajes"
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"

    def __str__(self):
        return f"De {self.remitente} en {self.conversacion}"


# --- Notificaciones ---
class Notificacion(BaseModel):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notificaciones")
    tipo = models.CharField(max_length=50)
    payload = models.JSONField(default=dict, blank=True)
    enviado_en = models.DateTimeField(auto_now_add=True)
    leido_en = models.DateTimeField(null=True, blank=True)
    canal = models.CharField(max_length=30, choices=[("push", "Push"), ("email", "Email"), ("sms", "SMS"), ("whatsapp", "WhatsApp")])
    reintentos = models.IntegerField(default=0)

    class Meta:
        db_table = "notificaciones"
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"

    def __str__(self):
        return f"{self.tipo} -> {self.usuario.username}"
