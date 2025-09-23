from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import Profile

@receiver(post_save, sender=User)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        # crea profile
        Profile.objects.create(user=instance)
        # por defecto asigna grupo "Residente" (si existe)
        try:
            residentes = Group.objects.get(name='Residente')
            instance.groups.add(residentes)
        except Group.DoesNotExist:
            pass
    else:
        instance.profile.save()
