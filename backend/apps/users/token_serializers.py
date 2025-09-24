from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        try:
            token['role'] = getattr(user.profile, 'role', '')
        except Exception:
            token['role'] = ''
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        try:
            data['role'] = getattr(self.user.profile, 'role', '')
        except Exception:
            data['role'] = ''
        return data
    
class EmailTokenObtainPairSerializer(MyTokenObtainPairSerializer):
    """
    Permite login usando `email` y `password` en lugar de `username`.
    Hereda de MyTokenObtainPairSerializer para asegurar que `role` esté en la respuesta.
    Expectativa del frontend: enviar {'email': '...', 'password': '...'}.
    """

    # Overriding validate to map email to username transparently
    def validate(self, attrs):
        # attrs normalmente contiene {'email': ..., 'password': ...}
        email = attrs.get('email')
        password = attrs.get('password')

        username = ''
        if email:
            try:
                user = User.objects.get(email__iexact=email)
                username = user.username
            except User.DoesNotExist:
                # dejar username vacío para que el flujo de autenticación falle con credenciales inválidas
                username = ''
        # Llamar al super con el dict esperado por TokenObtainPairSerializer
        return super().validate({'username': username, 'password': password})