from django.urls import path, include
from rest_framework import routers
from .views import RegisterView, UserViewSet, LogoutView
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

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    # endpoint de login (username)
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # endpoint alternativo de login por email (opcional)
    path('auth/login-by-email/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair_email'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # logout (blacklist refresh token) - requiere token_blacklist app activada
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('', include(router.urls)),
]
