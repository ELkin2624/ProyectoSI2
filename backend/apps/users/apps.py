from django.apps import AppConfig, apps
from django.contrib.auth.models import Group

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        import apps.users.signals  # importa señales

        # crear grupos por defecto si no existen
        grupos = ["Admin", "Empleado", "Residente", "JuntaDirectiva"]
        try:
            for g in grupos:
                Group.objects.get_or_create(name=g)
        except Exception:
            # evita errores en migraciones iniciales
            pass
