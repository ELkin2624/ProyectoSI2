from rest_framework import viewsets, status, permissions, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User, Group
from .serializers import UserSerializer, RegisterSerializer, AdminUserSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .models import Profile
from .permissions import IsInRequiredGroup
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

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
        
    

# CRUD de usuarios (protegido, por ejemplo sólo admin)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  #solo admin puede cambiar roles/listar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = []  # no modelos directos, usaremos filter por role con ?role=
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username', 'email']

    def get_serializer_class(self):
        """
        Usa AdminUserSerializer para escritura (create, update) y
        UserSerializer para lectura (list, retrieve).
        """
        if self.action in ['create', 'update', 'partial_update']:
            return AdminUserSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('profile') # Mejora de rendimiento
        # filtrar por role si se pasa ?role=
        role_q = self.request.query_params.get('role')
        if role_q:
            qs = qs.filter(profile__role=role_q)
        return qs
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        GET /users/me/ -> devuelve datos del usuario autenticado.
        """
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

# Si quieres mantener un endpoint público para listar solo residentes (por ejemplo), crea otro viewset o view con permisos adecuados.