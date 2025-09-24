from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Profile
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone']

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
        # Profile será creado por la señal post_save del User
        return user
      

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer para que el admin cree/edite usuarios y asigne su rol.
    """
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=False, write_only=True)
    # Renombramos 'role_read' a 'role' para consistencia, usando el source.
    role_display = serializers.CharField(source='profile.role', read_only=True)
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_active', 'is_staff', 'role', 'role_display', 'phone']
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


    def _assign_role_and_group(self, user, role, phone=None):
        """Método privado para asignar rol y grupo. También actualiza phone si se pasa."""
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role or profile.role
        if phone is not None:
            profile.phone = phone
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

    def create(self, validated_data):
        role = validated_data.pop('role', None)
        phone = None
        if 'profile' in validated_data:
            # no deberia venir profile directamente, pero por si acaso
            phone = validated_data['profile'].get('phone')
        password = validated_data.pop('password', None)
        # Usar create_user para asegurar hashing
        user = User.objects.create_user(**{k: v for k, v in validated_data.items() if k in ['username', 'email']})
        # Si hay otros campos como is_active/is_staff los aplicamos
        for attr in ['is_active', 'is_staff']:
            if attr in validated_data:
                setattr(user, attr, validated_data.get(attr))
        if password:
            user.set_password(password)
            user.save()

        # Asignar role y group
        if role is None:
            role = 'residente'
        self._assign_role_and_group(user, role, phone=validated_data.get('phone'))
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        phone = validated_data.pop('phone', None)

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

        if role or phone is not None:
            self._assign_role_and_group(instance, role or instance.profile.role, phone=phone)

        return instance