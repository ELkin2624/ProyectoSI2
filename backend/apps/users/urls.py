from django.urls import path, include
from rest_framework import routers
from .views import RegisterView, UserViewSet, LogoutView, EmpleadoViewSet, JuntaDirectivaViewSet, GuardiaViewSet, ChangePasswordView, ProfileView, VehiculoViewSet, ResidentesUnidadViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .token_serializers import MyTokenObtainPairSerializer, EmailTokenObtainPairSerializer

# Views que usan tus serializers custom
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# Si quieres soportar login por email también:
class EmailTokenObtainPairView(MyTokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'empleados', EmpleadoViewSet, basename='empleado')
router.register(r'junta', JuntaDirectivaViewSet, basename='junta')
router.register(r'guardias', GuardiaViewSet, basename='guardia')
router.register(r'vehiculos', VehiculoViewSet, basename='vehiculo')
router.register(r'residentes-unidad', ResidentesUnidadViewSet, basename='residentes_unidad')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login-by-email/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair_email'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
