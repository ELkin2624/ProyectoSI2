from django.urls import path, include
from rest_framework import routers
from .views import RegisterView, UserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .token_serializers import EmailTokenObtainPairSerializer, MyTokenObtainPairSerializer

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

#class MyTokenObtainPairView(TokenObtainPairView):
 #   serializer_class = EmailTokenObtainPairSerializer

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path("api/token/", MyTokenObtainPairSerializer.as_view(), name="token_obtain_pair"),
    path('', include(router.urls)),
]
