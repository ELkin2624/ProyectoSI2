# apps/users/signals.py
from django.db.models.signals import post_save, pre_save, post_migrate
from django.contrib.auth.models import User, Group
from django.dispatch import receiver
from .models import Profile
from django.db import IntegrityError, transaction
import logging
import io

logger = logging.getLogger(__name__)

try:
    import face_recognition
except Exception as e:
    face_recognition = None
    logger.warning("No se pudo importar face_recognition: %s. Los embeddings NO se generarán.", e)

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
            pass
        try:
            grp, _ = Group.objects.get_or_create(name="Residente")
            instance.groups.add(grp)
        except Exception:
            logger.exception("Error asignando grupo por defecto al usuario %s: %s", instance.pk, e)

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    grupos = ['Admin', 'Empleado', 'Residente', 'JuntaDirectiva', 'Guardia']
    for g in grupos:
        try:
            Group.objects.get_or_create(name=g)
        except Exception as e:
            logger.exception("Error creando grupo %s: %s", g, e)


@receiver(pre_save, sender=Profile)
def profile_pre_save(sender, instance, **kwargs):
    """
    Guardamos el nombre (path) de la foto anterior en el objeto instance para poder comparar
    en post_save si la foto cambió.
    """
    if not instance.pk:
        # Nuevo profile
        instance._old_foto_name = None
        return
    try:
        prev = Profile.objects.filter(pk=instance.pk).only("foto", "embedding").first()
        instance._old_foto_name = prev.foto.name if (prev and prev.foto) else None
        instance._old_embedding = prev.embedding if prev else None
    except Exception as e:
        instance._old_foto_name = None
        instance._old_embedding = None
        logger.exception("Error al obtener profile previo para pk=%s: %s", getattr(instance, "pk", None), e)


@receiver(post_save, sender=Profile)
def profile_post_save_generate_embedding(sender, instance, created, **kwargs):
    """
    Genera/actualiza el embedding facial cuando:
      - Se sube una foto nueva (foto cambia),
      - O cuando no existe embedding aún y hay una foto.
    Si la foto fue removida, limpia el embedding.
    """
    if face_recognition is None:
        # No instalado o no disponible: no intentamos generar embeddings.
        logger.debug("face_recognition no disponible, no se generará embedding para profile %s", instance.pk)
        return

    try:
        new_name = instance.foto.name if instance.foto else None
        old_name = getattr(instance, "_old_foto_name", None)

        # Caso: foto eliminada -> limpiar embedding si existía
        if new_name is None and old_name is not None and instance.embedding:
            Profile.objects.filter(pk=instance.pk).update(embedding=None)
            logger.info("Foto eliminada para profile %s -> embedding limpiado", instance.pk)
            return

        # Si no hay foto, nada que hacer
        if new_name is None:
            return

        # Si la foto no cambió y ya existe embedding, no regenerar (cerramos)
        if old_name == new_name and instance.embedding:
            logger.debug("Foto sin cambios y embedding existe para profile %s -> no regeneramos", instance.pk)
            return

        # Abrimos la imagen (funciona con storages locales y remotos que provean file-like)
        try:
            # instance.foto.open() puede lanzar si storage remoto no accesible; capturamos.
            instance.foto.open(mode='rb')
            try:
                image = face_recognition.load_image_file(instance.foto)
            finally:
                try:
                    instance.foto.close()
                except Exception:
                    pass
        except Exception as e:
            logger.exception("No se pudo abrir la imagen para profile %s: %s", instance.pk, e)
            # No hacemos nada (no guardamos embedding)
            return

        # Detectar caras y obtener encoding (usamos la primera cara detectada)
        try:
            face_locations = face_recognition.face_locations(image, model="hog")
            if not face_locations:
                # No se detectó cara, guardamos embedding=None para reflejarlo
                Profile.objects.filter(pk=instance.pk).update(embedding=None)
                logger.warning("No se detectó cara en la foto de profile %s. embedding set a None.", instance.pk)
                return

            encodings = face_recognition.face_encodings(image, known_face_locations=[face_locations[0]])
            if not encodings:
                Profile.objects.filter(pk=instance.pk).update(embedding=None)
                logger.warning("No se calculó encoding para profile %s. embedding set a None.", instance.pk)
                return

            embedding = encodings[0].tolist()
            # Usamos update() para evitar triggers adicionales de signals/save
            Profile.objects.filter(pk=instance.pk).update(embedding=embedding)
            logger.info("Embedding generado y guardado para profile %s", instance.pk)

        except Exception as e:
            logger.exception("Error procesando la imagen para profile %s: %s", instance.pk, e)

    except Exception as e:
        logger.exception("Error inesperado en signal post_save Profile pk=%s: %s", getattr(instance, "pk", None), e)