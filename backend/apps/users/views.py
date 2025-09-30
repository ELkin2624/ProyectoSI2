from rest_framework import viewsets, status, permissions, generics, filters, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User, Group
from .serializers import UserSerializer, RegisterSerializer, AdminUserSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .models import Profile, Vehiculo
from .permissions import IsInRequiredGroup
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.facilidades.models import ResidentesUnidad
from .serializers import ChangePasswordSerializer, ProfileSerializer, VehiculoSerializer
from apps.facilidades.serializers import ResidentesUnidadSerializer

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
    
class LogoutView(APIView):
    """
    Logout: blacklistear el refresh token (si tienes rest_framework_simplejwt.token_blacklist activado).
    Frontend debe enviar: { "refresh": "<token>" }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token or logout failed.", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD de usuarios:
    - lectura con UserSerializer
    - escritura (create/update) con AdminUserSerializer
    Control de acceso por `required_groups_map` (por acción).
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['profile__role', 'is_active']   # filtros útiles
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username', 'email']

    # Mapeo: action -> grupos requeridos
    required_groups_map = {
        'list': ['Admin'],
        'create': ['Admin'],
        'retrieve': ['Admin'],  # admin por defecto para ver usuarios
        'update': ['Admin'],
        'partial_update': ['Admin'],
        'destroy': ['Admin'],
    }

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminUserSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('profile')
        role_q = self.request.query_params.get('role')
        if role_q:
            qs = qs.filter(profile__role=role_q)
        return qs

    def get_permissions(self):
        # /users/me/ -> cualquier usuario autenticado puede obtener sus datos
        if self.action == 'me':
            return [IsAuthenticated()]

        # Definir required_groups segun map
        required = self.required_groups_map.get(self.action)
        if required:
            self.required_groups = required
            return [IsInRequiredGroup()]
        self.required_groups = ['Admin']
        return [IsInRequiredGroup()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        read_serializer = UserSerializer(user, context={'request': request})
        data = read_serializer.data
        temp_password = getattr(user, "_temp_password", None)
        if temp_password:
            data['temp_password'] = temp_password
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
class EmpleadoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(profile__role='empleado').select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsInRequiredGroup]
    required_groups = ['Admin', 'Empleado']  # Admin y Empleado pueden acceder
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email']

class JuntaDirectivaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(profile__role='junta').select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsInRequiredGroup]
    required_groups = ['Admin', 'JuntaDirectiva']

class GuardiaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(profile__role='guardia').select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsInRequiredGroup]
    required_groups = ['Admin', 'Guardia']

class ChangePasswordView(generics.UpdateAPIView):
    """
    PUT /users/change-password/  body: { old_password, new_password }
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old = serializer.validated_data['old_password']
        new = serializer.validated_data['new_password']

        if not user.check_password(old):
            return Response({'old_password': ['Contraseña actual incorrecta.']}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new)
        user.save()
        return Response({'detail': 'Contraseña actualizada.'}, status=status.HTTP_200_OK)

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /users/profile/ -> editar teléfono u otros campos del Profile del propio usuario
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        return self.request.user.profile

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.select_related("usuario", "unidad").all()
    serializer_class = VehiculoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["usuario", "unidad", "placa"]
    search_fields = ["placa", "marca", "modelo"]

class ResidentesUnidadViewSet(viewsets.ModelViewSet):
    queryset = ResidentesUnidad.objects.select_related("unidad", "usuario").all()
    serializer_class = ResidentesUnidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["unidad", "usuario", "rol", "es_principal"]
    search_fields = ["unidad__numero_unidad", "usuario__username", "usuario__email"]
