# apps/usuarios/views_face.py
import face_recognition
import numpy as np
import tempfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class FaceRegisterView(APIView):
    """
    Guarda embedding en el perfil del usuario a partir de una foto
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        foto = request.FILES.get("foto")
        if not foto:
            return Response({"error": "No se envió ninguna foto"}, status=status.HTTP_400_BAD_REQUEST)

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            for chunk in foto.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        image = face_recognition.load_image_file(tmp_path)
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return Response({"error": "No se detectó ninguna cara"}, status=status.HTTP_400_BAD_REQUEST)

        encoding = face_recognition.face_encodings(image, known_face_locations=[face_locations[0]])[0]
        profile = request.user.profile
        profile.embedding = encoding.tolist()
        profile.foto = foto
        profile.save()

        return Response({"message": "Embedding guardado correctamente"}, status=status.HTTP_200_OK)


class FaceLoginView(APIView):
    """
    Login por rostro: compara embedding recibido contra todos los perfiles registrados
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        foto = request.FILES.get("foto")
        if not foto:
            return Response({"error": "No se envió ninguna foto"}, status=status.HTTP_400_BAD_REQUEST)

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            for chunk in foto.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        image = face_recognition.load_image_file(tmp_path)
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return Response({"error": "No se detectó ninguna cara"}, status=status.HTTP_400_BAD_REQUEST)

        encoding_actual = face_recognition.face_encodings(image, known_face_locations=[face_locations[0]])[0]

        usuarios = User.objects.filter(profile__embedding__isnull=False)
        for u in usuarios:
            emb_guardado = np.array(u.profile.embedding)
            result = face_recognition.compare_faces([emb_guardado], encoding_actual, tolerance=0.5)
            if result[0]:
                refresh = RefreshToken.for_user(u)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": u.id,
                        "username": u.username,
                        "email": u.email,
                        "role": u.profile.role,
                        "foto": request.build_absolute_uri(u.profile.foto.url) if u.profile.foto else None
                    }
                })

        return Response({"error": "No se encontró coincidencia"}, status=status.HTTP_401_UNAUTHORIZED)
