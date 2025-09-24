from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status, permissions, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User, Group
from .serializers import UserSerializer, RegisterSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer, AdminUserSerializer
from .models import Profile

# Registrar usuarios (público)
class RegisterView(generics.CreateAPIView):
    """
    Registro público: crea User + Profile (por el serializer) y devuelve tokens JWT + role.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar tokens JWT para el usuario creado
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        # obtener role de manera segura
        try:
            role = getattr(user.profile, 'role', '')
        except Exception:
            role = ''

        data = {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": access,
            "role": role,
        }

        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

# CRUD de usuarios (protegido, por ejemplo sólo admin)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  #solo admin puede cambiar roles/listar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = []  # no modelos directos, usaremos filter por role con ?role=
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username', 'email']

    def get_queryset(self):
        qs = super().get_queryset()
        # filtrar por role si se pasa ?role=
        role_q = self.request.query_params.get('role')
        if role_q:
            qs = qs.filter(profile__role=role_q)
        return qs

    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        mapping = {
            'admin': 'Admin',
            'empleado': 'Empleado',
            'residente': 'Residente',
            'junta': 'JuntaDirectiva',
        }
        if role not in mapping:
            return Response({'detail': 'role inválido'}, status=status.HTTP_400_BAD_REQUEST)
        # update profile & groups
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()
        user.groups.clear()
        grp, _ = Group.objects.get_or_create(name=mapping[role])
        user.groups.add(grp)
        if role == 'admin':
            user.is_staff = True
            user.save()
        return Response({'detail': 'rol actualizado'})

# Si quieres mantener un endpoint público para listar solo residentes (por ejemplo), crea otro viewset o view con permisos adecuados.