# apps/users/signals.py
from django.db.models.signals import post_save, post_migrate
from django.contrib.auth.models import User, Group
from django.dispatch import receiver
from .models import Profile
from django.db import IntegrityError, transaction

@receiver(post_save, sender=User)
def ensure_profile_and_default_group(sender, instance, created, **kwargs):
    """
    Asegura que todo User tenga un Profile (get_or_create) y asigna el grupo 'Residente'
    al crearse un usuario nuevo.
    get_or_create evita errores de llave duplicada.
    """
    profile, created_profile = Profile.objects.get_or_create(user=instance)
    if created:
        # solo si el usuario fue creado ahora, asignamos el grupo Residente (si existe)
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
