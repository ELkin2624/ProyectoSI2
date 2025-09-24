# apps/users/signals.py
from django.db.models.signals import post_save, post_migrate
from django.contrib.auth.models import User, Group
from django.dispatch import receiver
from .models import Profile
from django.db import IntegrityError, transaction

@receiver(post_save, sender=User)
def ensure_profile_and_default_group(sender, instance, created, **kwargs):
    """
    Solo crear Profile si el User fue creado ahora (created==True).
    Usamos transaction.atomic() y capturamos IntegrityError para evitar
    errores de llave duplicada en caso de race condition (admin inline, tests, etc.).
    """
    if created:
        try:
            with transaction.atomic():
                Profile.objects.create(user=instance)
        except IntegrityError:
            # Otro proceso ya creó el profile; no hacemos nada
            pass

        # asignar grupo por defecto
        try:
            grp, _ = Group.objects.get_or_create(name="Residente")
            instance.groups.add(grp)
        except Exception:
            pass

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    grupos = ['Admin', 'Empleado', 'Residente', 'JuntaDirectiva']
    for g in grupos:
        Group.objects.get_or_create(name=g)
