from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from .serializers import UserSerializer, RegisterSerializer

# Registrar usuarios (público)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# CRUD de usuarios (protegido, por ejemplo sólo admin)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  #solo admin puede cambiar roles/listar

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def set_role(self, request, pk=None):
        """Asignar rol a un usuario (solo admin)"""
        user = self.get_object()
        role = request.data.get("role")

        mapping = {
            "admin": "Admin",
            "empleado": "Empleado",
            "residente": "Residente",
            "junta": "JuntaDirectiva",
        }
        if role not in mapping:
            return Response({"detail": "Role inválido"}, status=status.HTTP_400_BAD_REQUEST)

        # quitar roles previos
        user.groups.clear()
        # asignar nuevo grupo
        grp, _ = Group.objects.get_or_create(name=mapping[role])
        user.groups.add(grp)
        # actualizar profile
        user.profile.role = role
        user.profile.save()

        return Response({"detail": f"Rol de {user.username} actualizado a {role}"})

class IsInRequiredGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        required = getattr(view, 'required_groups', None)
        if not required:
            return True  # si no hay grupos requeridos, permitir
        if not request.user or not request.user.is_authenticated:
            return False
        user_groups = request.user.groups.values_list('name', flat=True)
        return any(group in user_groups for group in required)