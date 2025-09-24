from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        # attrs normalmente contiene 'email' y 'password' si frontend los envía así.
        credentials = {
            'username': attrs.get('email'),
            'password': attrs.get('password')
        }
        # buscar usuario por email y usar su username para autenticar
        try:
            user = User.objects.get(email=attrs.get('email'))
            credentials['username'] = user.username
        except User.DoesNotExist:
            pass

        return super().validate({'username': credentials['username'], 'password': credentials['password']})


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