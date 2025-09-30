from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollView,VerifyLiveView

router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
    path("enroll/", EnrollView.as_view(), name="ia-enroll"),
    path("verify-live/", VerifyLiveView.as_view(), name="ia-verify-live"),
]
