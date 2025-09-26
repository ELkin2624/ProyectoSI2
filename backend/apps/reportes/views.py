from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from apps.facilidades.models import Condominio, Unidad
from apps.finanzas.models import Factura, Pago
from .models import ReporteMorosidad
from .serializers import ReporteMorosidadSerializer

import csv
import io
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from rest_framework.views import APIView
from apps.bookings.models import Reserva
from apps.seguridad.models import RegistroAcceso, AlertaPanico
from apps.facilidades.models import Incidencia
from django.utils.timezone import now
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class ReporteMorosidadViewSet(viewsets.ModelViewSet):
    queryset = ReporteMorosidad.objects.all().order_by("-generado_en")
    serializer_class = ReporteMorosidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="generar")
    def generar_reporte(self, request):
        condominio_id = request.data.get("condominio_id")
        if not condominio_id:
            return Response({"error": "Debe enviar condominio_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            condominio = Condominio.objects.get(id=condominio_id)
        except Condominio.DoesNotExist:
            return Response({"error": "Condominio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Buscar facturas pendientes de pago
        facturas_pendientes = Factura.objects.filter(condominio=condominio, estado="pendiente")

        datos = []
        for factura in facturas_pendientes:
            unidad = factura.unidad
            pagos = Pago.objects.filter(factura=factura, estado="success")
            pagado = sum([p.monto for p in pagos])
            deuda = float(factura.monto) - float(pagado)

            if deuda > 0:
                datos.append({
                    "unidad": unidad.numero_unidad if unidad else None,
                    "propietario": unidad.propietario_user.username if unidad and unidad.propietario_user else None,
                    "monto_pendiente": deuda,
                    "fecha_vencimiento": factura.fecha_vencimiento,
                })

        # Guardar reporte en BD
        reporte = ReporteMorosidad.objects.create(
            condominio=condominio,
            generado_en=now(),
            datos={"morosos": datos}
        )

        return Response(ReporteMorosidadSerializer(reporte).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="exportar/json")
    def exportar_json(self, request, pk=None):
        """
        Exporta el reporte en JSON.
        """
        reporte = self.get_object()
        return Response(reporte.datos, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="exportar/csv")
    def exportar_csv(self, request, pk=None):
        """
        Exporta el reporte en formato CSV.
        """
        reporte = self.get_object()
        datos = reporte.datos.get("morosos", [])

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="reporte_morosidad_{reporte.id}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Unidad", "Propietario", "Monto Pendiente", "Fecha Vencimiento"])

        for d in datos:
            writer.writerow([
                d.get("unidad"),
                d.get("propietario"),
                d.get("monto_pendiente"),
                d.get("fecha_vencimiento"),
            ])

        return response

    @action(detail=True, methods=["get"], url_path="exportar/pdf")
    def exportar_pdf(self, request, pk=None):
        """
        Exporta el reporte en formato PDF.
        """
        reporte = self.get_object()
        datos = reporte.datos.get("morosos", [])

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, height - 50, f"Reporte de Morosidad - {reporte.condominio.nombre}")
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 70, f"Generado en: {reporte.generado_en.strftime('%Y-%m-%d %H:%M')}")

        # Encabezados de tabla
        y = height - 120
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Unidad")
        p.drawString(150, y, "Propietario")
        p.drawString(300, y, "Monto Pendiente")
        p.drawString(430, y, "Fecha Vencimiento")

        p.setFont("Helvetica", 10)
        y -= 20

        # Contenido
        for d in datos:
            p.drawString(50, y, str(d.get("unidad")))
            p.drawString(150, y, str(d.get("propietario")))
            p.drawString(300, y, str(d.get("monto_pendiente")))
            p.drawString(430, y, str(d.get("fecha_vencimiento")))
            y -= 20
            if y < 100:
                p.showPage()
                y = height - 50

        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="reporte_morosidad_{reporte.id}.pdf"'
        return response
    
class ReportesGeneralesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        condominio_id = request.query_params.get("condominio_id")
        formato = request.query_params.get("format", "json")

        if not condominio_id:
            return Response({"error": "Debe enviar condominio_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            condominio = Condominio.objects.get(id=condominio_id)
        except Condominio.DoesNotExist:
            return Response({"error": "Condominio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # --- Construir reporte general ---
        facturas_pendientes = Factura.objects.filter(condominio=condominio, estado="pendiente")
        morosidad = []
        for factura in facturas_pendientes:
            unidad = factura.unidad
            pagos = Pago.objects.filter(factura=factura, estado="success")
            pagado = sum([p.monto for p in pagos])
            deuda = float(factura.monto) - float(pagado)
            if deuda > 0:
                morosidad.append({
                    "unidad": unidad.numero_unidad if unidad else None,
                    "propietario": unidad.propietario_user.username if unidad and unidad.propietario_user else None,
                    "monto_pendiente": deuda,
                    "fecha_vencimiento": factura.fecha_vencimiento,
                })

        reservas = Reserva.objects.filter(instalacion__condominio=condominio).values("instalacion__nombre", "estado")
        accesos = RegistroAcceso.objects.filter(condominio=condominio).values("tipo", "resultado")
        incidencias = Incidencia.objects.filter(condominio=condominio).values("estado", "prioridad")
        alertas = AlertaPanico.objects.filter(condominio=condominio).values("tipo", "nivel")

        reporte_general = {
            "condominio": condominio.nombre,
            "generado_en": now(),
            "morosidad": morosidad,
            "reservas": list(reservas),
            "accesos": list(accesos),
            "incidencias": list(incidencias),
            "alertas": list(alertas),
        }

        # --- Exportación CSV ---
        if formato == "csv":
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(["Sección", "Detalle"])
            writer.writerow(["Condominio", condominio.nombre])
            writer.writerow(["Generado en", now()])

            writer.writerow([])
            writer.writerow(["Morosidad"])
            writer.writerow(["Unidad", "Propietario", "Monto Pendiente", "Fecha Vencimiento"])
            for m in morosidad:
                writer.writerow([m["unidad"], m["propietario"], m["monto_pendiente"], m["fecha_vencimiento"]])

            writer.writerow([])
            writer.writerow(["Reservas"])
            writer.writerow(["Instalación", "Estado"])
            for r in reservas:
                writer.writerow([r["instalacion__nombre"], r["estado"]])

            writer.writerow([])
            writer.writerow(["Accesos"])
            writer.writerow(["Tipo", "Resultado"])
            for a in accesos:
                writer.writerow([a["tipo"], a["resultado"]])

            response = HttpResponse(buffer.getvalue(), content_type="text/csv")
            response["Content-Disposition"] = f'attachment; filename="reporte_general_{condominio.nombre}.csv"'
            return response

        # --- Exportación PDF ---
        if formato == "pdf":
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = []

            elements.append(Paragraph(f"Reporte General - {condominio.nombre}", styles["Title"]))
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(f"Generado en: {now()}", styles["Normal"]))
            elements.append(Spacer(1, 24))

            # Morosidad
            elements.append(Paragraph("Morosidad", styles["Heading2"]))
            if morosidad:
                data = [["Unidad", "Propietario", "Monto Pendiente", "Fecha Vencimiento"]]
                for m in morosidad:
                    data.append([m["unidad"], m["propietario"], m["monto_pendiente"], str(m["fecha_vencimiento"])])
                table = Table(data, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ]))
                elements.append(table)
            else:
                elements.append(Paragraph("No hay morosos.", styles["Normal"]))

            doc.build(elements)
            pdf = buffer.getvalue()
            buffer.close()

            response = HttpResponse(pdf, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="reporte_general_{condominio.nombre}.pdf"'
            return response

        # --- Respuesta JSON por defecto ---
        return Response(reporte_general, status=status.HTTP_200_OK)