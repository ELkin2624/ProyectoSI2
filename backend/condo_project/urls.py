from django.contrib import admin
from django.urls import path, include

from rest_framework import routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.conf.urls.static import static

schema_view = get_schema_view(
    openapi.Info(
        title="Condo API",
        default_version='v1',
        description="API del sistema de gestión de condominio",
    ),
    public=True,
    permission_classes=[AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    path('api/', include('apps.users.urls')),
    path('api/facilidades/', include('apps.facilidades.urls')),
    path('api/finanzas/', include('apps.finanzas.urls')),
    path('api/comunicaciones/', include('apps.comunicaciones.urls')),
    path('api/seguridad/', include('apps.seguridad.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/ia/', include('apps.ia.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#if settings.DEBUG:
 #   urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
