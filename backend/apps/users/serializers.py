from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # 1. crear usuario
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
    

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer para admin: permite crear/editar usuarios y asignar role.
    role debe ser una de: 'admin','empleado','residente','junta'
    """
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=False, write_only=True)
    role_read = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_active', 'is_staff', 'role', 'role_read']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_staff': {'required': False},
        }

    def create(self, validated_data):
        role = validated_data.pop('role', 'residente')
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        # crear o asegurar profile
        Profile.objects.get_or_create(user=user, defaults={'role': role})
        # asignar grupo
        mapping = {
            'admin': 'Admin',
            'empleado': 'Empleado',
            'residente': 'Residente',
            'junta': 'JuntaDirectiva',
        }
        grp_name = mapping.get(role, 'Residente')
        grp, _ = Group.objects.get_or_create(name=grp_name)
        user.groups.add(grp)
        # opcional: si role == 'admin' marca is_staff/superuser según política
        if role == 'admin':
            user.is_staff = True
            # no forzar superuser a menos que quieras
            user.save()
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        # actualizar campos básicos
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        # actualizar perfil/role
        if role:
            profile, _ = Profile.objects.get_or_create(user=instance)
            profile.role = role
            profile.save()
            # actualizar grupos: limpiar y poner el correspondiente
            mapping = {
                'admin': 'Admin',
                'empleado': 'Empleado',
                'residente': 'Residente',
                'junta': 'JuntaDirectiva',
            }
            instance.groups.clear()
            grp_name = mapping.get(role, 'Residente')
            grp, _ = Group.objects.get_or_create(name=grp_name)
            instance.groups.add(grp)
            if role == 'admin':
                instance.is_staff = True
                instance.save()
        return instance
