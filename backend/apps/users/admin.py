from django.contrib import admin

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile, Vehiculo
from apps.facilidades.models import ResidentesUnidad

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Perfil'

class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ("placa", "usuario", "unidad", "marca", "modelo", "color")
    search_fields = ("placa", "usuario__username", "unidad__numero_unidad")
    list_filter = ("marca", "color")

#@admin.register(ResidentesUnidad)
#class ResidentesUnidadAdmin(admin.ModelAdmin):
#    list_display = ("unidad", "usuario", "rol", "es_principal", "desde", "hasta")
#    list_filter = ("rol", "es_principal")
#    search_fields = ("unidad__numero_unidad", "usuario__username", "usuario__email")

