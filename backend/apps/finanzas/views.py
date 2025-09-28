# apps/finanzas/views.py
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model

from .models import Factura, Cargo, Pago, EnlacePago
from .serializers import FacturaSerializer, CargoSerializer, PagoSerializer, EnlacePagoSerializer

User = get_user_model()

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
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="pagar")
    def pagar(self, request, pk=None):
        """
        Acción atómica: crea un Pago y marca la Factura como pagada.
        Body opcional: { usuario, monto, metodo, proveedor_pasarela, url_comprobante, estado }
        Si 'usuario' no viene, se usa request.user.
        Si 'monto' no viene, se usa factura.monto.
        """
        factura = self.get_object()
        # evitar pagar si ya está pagada
        if factura.estado == "pagada":
            return Response({"detail": "Factura ya está marcada como pagada."}, status=status.HTTP_400_BAD_REQUEST)

        usuario_id = request.data.get("usuario")
        try:
            usuario = User.objects.get(pk=usuario_id) if usuario_id else request.user
        except User.DoesNotExist:
            return Response({"usuario": ["Usuario no encontrado"]}, status=status.HTTP_400_BAD_REQUEST)

        monto = request.data.get("monto", factura.monto)
        metodo = request.data.get("metodo", "cash")
        proveedor = request.data.get("proveedor_pasarela", None)
        url_comprobante = request.data.get("url_comprobante", None)
        estado_pago = request.data.get("estado", "success")  # por defecto success si admin registra

        with transaction.atomic():
            pago_data = {
                "factura": factura.id,
                "unidad": factura.unidad.id,
                "usuario": usuario.id,
                "monto": monto,
                "metodo": metodo,
                "proveedor_pasarela": proveedor,
                "url_comprobante": url_comprobante,
                "estado": estado_pago,
            }
            pago_serializer = PagoSerializer(data=pago_data, context={"request": request})
            pago_serializer.is_valid(raise_exception=True)
            pago = pago_serializer.save()

            factura.estado = "pagada"
            factura.save()

        salida = {
            "pago": PagoSerializer(pago).data,
            "factura": FacturaSerializer(factura).data,
        }
        return Response(salida, status=status.HTTP_201_CREATED)

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

# Simple API para buscar usuarios (autocomplete)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer

class SimpleUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")

class UserSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        qs = User.objects.all()
        if q:
            qs = qs.filter(
                Q(username__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q)
            )
        qs = qs.order_by("username")[:20]
        data = SimpleUserSerializer(qs, many=True).data
        return Response(data)