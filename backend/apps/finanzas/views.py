# apps/finanzas/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from .models import Factura, Cargo, Pago, EnlacePago
from .serializers import FacturaSerializer, CargoSerializer, PagoSerializer, EnlacePagoSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all().select_related("unidad", "condominio")
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["estado", "unidad", "condominio"]
    search_fields = ["numero_factura"]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def morosos(self, request):
        """
        CU8: Reporte de morosidad.
        Devuelve residentes con facturas vencidas y no pagadas.
        """
        hoy = timezone.now().date()
        facturas_vencidas = Factura.objects.filter(estado="pendiente", fecha_vencimiento__lt=hoy)
        data = {}
        for f in facturas_vencidas:
            unidad = f.unidad.numero_unidad
            if unidad not in data:
                data[unidad] = {
                    "unidad": unidad,
                    "condominio": f.condominio.nombre,
                    "facturas": [],
                    "total_pendiente": 0,
                }
            data[unidad]["facturas"].append({
                "numero_factura": f.numero_factura,
                "monto": float(f.monto),
                "fecha_vencimiento": str(f.fecha_vencimiento),
            })
            data[unidad]["total_pendiente"] += float(f.monto)
        return Response(list(data.values()))

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all().select_related("factura")
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated]

class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all().select_related("factura", "unidad", "usuario")
    serializer_class = PagoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["usuario", "unidad", "estado"]

class EnlacePagoViewSet(viewsets.ModelViewSet):
    queryset = EnlacePago.objects.all().select_related("condominio", "unidad")
    serializer_class = EnlacePagoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["condominio", "unidad", "estado"]
    search_fields = ["enlace"]

