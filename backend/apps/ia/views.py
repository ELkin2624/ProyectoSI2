# apps/ia/views.py
import os
import base64
import cv2
import numpy as np
from deepface import DeepFace
from django.conf import settings
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

from rest_framework.permissions import AllowAny

User = get_user_model()

# Umbral recomendado (ajusta según pruebas). ArcFace suele ser más estricta: 0.4-0.6
DEFAULT_THRESHOLD = 0.6

class EnrollView(APIView):
    """
    Enrolar usuario: guarda foto en Profile.foto y calcula embedding en Profile.embedding.
    Recibe JSON: { "user_id": <id>, "image": "data:image/jpeg;base64,..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            user_id = request.data.get("user_id")
            image_b64 = request.data.get("image")

            if not user_id or not image_b64:
                return Response({"error": "Faltan parámetros 'user_id' o 'image'."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

            profile = getattr(user, "profile", None)
            if not profile:
                return Response({"error": "El usuario no tiene Profile asociado."}, status=status.HTTP_400_BAD_REQUEST)

            # Decodificar base64 y guardar imagen en profile.foto
            header, encoded = image_b64.split(",", 1) if "," in image_b64 else (None, image_b64)
            img_bytes = base64.b64decode(encoded)
            filename = f"user_{user_id}.jpg"
            profile.foto.save(filename, ContentFile(img_bytes), save=False)

            # Convertir bytes a numpy array (BGR)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                return Response({"error": "No se pudo decodificar la imagen."}, status=status.HTTP_400_BAD_REQUEST)

            # Calcular embedding con DeepFace (ArcFace)
            try:
                reps = DeepFace.represent(img_path = frame, model_name="ArcFace", enforce_detection=True)
                # DeepFace.represent puede devolver una lista o lista de listas, normalizamos:
                if isinstance(reps, list) and len(reps) > 0:
                    embedding = reps[0]
                else:
                    embedding = reps
            except Exception as e:
                # si falla la detección, guarda la foto pero informa
                profile.save()
                return Response({"error": "No se pudo extraer embedding: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # Guardar embedding (lista de floats)
            profile.embedding = [float(x) for x in np.array(embedding).tolist()]
            profile.save()

            return Response({"status":"ok", "msg":"Enrolado con éxito", "user": user.username}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyLiveView(APIView):
    """
    Recibe frame en base64 y compara contra embedding guardado en profile.embedding.
    JSON: { "user_id": <id>, "image": "data:image/jpeg;base64,..." }
    Responde: { "verified": bool, "distance": float, "threshold": float, "msg": str }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            user_id = request.data.get("user_id")
            image_b64 = request.data.get("image")

            if not user_id or not image_b64:
                return Response({"error": "Faltan parámetros 'user_id' o 'image'."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

            profile = getattr(user, "profile", None)
            if not profile:
                return Response({"error": "El usuario no tiene Profile asociado."}, status=status.HTTP_400_BAD_REQUEST)

            # Decodificar imagen
            header, encoded = image_b64.split(",", 1) if "," in image_b64 else (None, image_b64)
            img_bytes = base64.b64decode(encoded)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                return Response({"error": "No se pudo decodificar la imagen."}, status=status.HTTP_400_BAD_REQUEST)

            # Si existe embedding guardado, comparar euclidiana:
            if profile.embedding:
                # calcular embedding del frame
                try:
                    reps = DeepFace.represent(img_path = frame, model_name="ArcFace", enforce_detection=True)
                    if isinstance(reps, list) and len(reps) > 0:
                        incoming_embedding = np.array(reps[0], dtype=np.float64)
                    else:
                        incoming_embedding = np.array(reps, dtype=np.float64)
                except Exception as e:
                    return Response({"error": "No se detectó rostro en el frame: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)

                stored = np.array(profile.embedding, dtype=np.float64)
                distance = float(np.linalg.norm(stored - incoming_embedding))

                threshold = DEFAULT_THRESHOLD
                verified = distance < threshold

                return Response({
                    "verified": bool(verified),
                    "distance": distance,
                    "threshold": threshold,
                    "user": user.username
                }, status=status.HTTP_200_OK)

            else:
                # Si no hay embedding, intentamos comparar usando la foto guardada como fallback
                if profile.foto and os.path.exists(profile.foto.path):
                    try:
                        result = DeepFace.verify(img1_path=profile.foto.path, img2_path=frame, model_name="ArcFace", enforce_detection=True)
                        # result contiene 'verified' y 'distance' o 'cosine' etc según versión
                        verified = result.get("verified", False)
                        distance = result.get("distance") or result.get("cosine") or None
                        return Response({"verified": bool(verified), "distance": distance, "fallback": True}, status=status.HTTP_200_OK)
                    except Exception as e:
                        return Response({"error": "Error en fallback verify: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "No hay embedding ni foto de referencia para este usuario."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
