from django.contrib.auth.models import Group
from rest_framework import serializers
from .models import Profile, Vehiculo
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
import secrets
import string
from apps.facilidades.models import ResidentesUnidad

from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'is_active', 'foto_url']

    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            return profile.role
        return None

    def get_phone(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            return profile.phone
        return None
    
    def get_foto_url(self, obj):
        profile = getattr(obj, 'profile', None)
        request = self.context.get('request') if hasattr(self, 'context') else None
        if profile and profile.foto:
            if request:
                return request.build_absolute_uri(profile.foto.url)
            return profile.foto.url
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True}          
        }
    
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_password(self, value):
        # Usar validadores de Django (longitud, complejidad, etc.)
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.pop("password")
        user = User.objects.create_user(username=username, email=email, password=password)
        return user
      
class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer para que el admin cree/edite usuarios y asigne su rol.
    Exponemos `role` tanto en lectura como en escritura y también `phone`.
    """
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=False, write_only=True)
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    temp_password = serializers.CharField(read_only=True)
    foto = serializers.ImageField(source='profile.foto', required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_active', 'is_staff', 'role', 'phone', 'temp_password', 'foto']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_staff': {'required': False},
            'email': {'required': True} 
        }
    
    def validate_email(self, value):
        # When creating, ensure email uniqueness
        user_qs = User.objects.filter(email__iexact=value)
        if self.instance:
            user_qs = user_qs.exclude(pk=self.instance.pk)
        if user_qs.exists():
            raise serializers.ValidationError("Este email ya está registrado por otro usuario.")
        return value


    def _assign_role_and_group(self, user, role, phone=None, foto=None):
        """Método privado para asignar rol y grupo. También actualiza phone si se pasa."""
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role or profile.role
        if phone is not None:
            profile.phone = phone
        if foto is not None:
            profile.foto = foto
        profile.save()

        grp_name = profile.group_name
        grp, _ = Group.objects.get_or_create(name=grp_name)

        # Limpiar y asignar grupo principal (según diseño)
        user.groups.clear()
        user.groups.add(grp)

        # El rol 'admin' debe marcar is_staff=True
        if profile.role == 'admin':
            user.is_staff = True
        else:
            user.is_staff = False
        user.save()


    def _generate_temp_password(self, length=10):
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for i in range(length))
    

    def create(self, validated_data):
        # role puede venir como campo directo
        role = validated_data.pop('role', None)
        profile_data = validated_data.pop('profile', {}) if 'profile' in validated_data else {}
        phone = profile_data.get('phone') or validated_data.pop('phone', None)
        password = validated_data.pop('password', None)
        foto = profile_data.get('foto') or validated_data.pop('foto', None)

        if password:
            user = User.objects.create_user(**{k: v for k, v in validated_data.items() if k in ['username', 'email']}, password=password)
            temp_password = None
        else:
            temp_password = self._generate_temp_password()
            user = User.objects.create_user(**{k: v for k, v in validated_data.items() if k in ['username', 'email']}, password=temp_password)

        # aplicar is_active/is_staff si se pasaron
        for attr in ['is_active', 'is_staff']:
            if attr in validated_data:
                setattr(user, attr, validated_data.get(attr))
        user.save()

        if role is None:
            role = 'residente'
        self._assign_role_and_group(user, role, phone=phone, foto=foto)

        # Adjuntamos temp_password en instancia del serializer para que la vista lo use si lo necesita
        user._temp_password = temp_password
        return user


    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        profile_data = validated_data.pop('profile', {}) if 'profile' in validated_data else {}
        phone = profile_data.get('phone', None) or validated_data.pop('phone', None)
        foto = profile_data.get('foto', None) or validated_data.pop('foto', None)

        # Actualizar campos básicos del User (sin password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if password:
            # validar password si es provisto
            try:
                validate_password(password, user=instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})
            instance.set_password(password)
            instance.save()

        if role or phone is not None or foto is not None:
            self._assign_role_and_group(instance, role or instance.profile.role, phone=phone, foto=foto)

        return instance
    
class ProfileSerializer(serializers.ModelSerializer):
    #role = serializers.SerializerMethodField(read_only=True)
    #foto = serializers.ImageField(required=False, allow_null=True)
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['role', 'phone', 'foto', 'foto_url', 'embedding']
        extra_kwargs = {
            'embedding': {'read_only': True}
        }

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'
        ref_name = "VehiculoUserSerializer"

class ResidentesUnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentesUnidad
        fields = '__all__'
        ref_name = "ResidentesUnidadUserSerializer"

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)