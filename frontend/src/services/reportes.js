import api from "./api";

// --- Reporte General ---
export const getReporteGeneral = (condominioId, formato = "json") =>
  api.get(`/reportes/general/?condominio_id=${condominioId}&format=${formato}`);

// --- Reportes Morosidad ---
export const getReportesMorosidad = () => api.get("/reportes/morosidad/");

export const generarReporteMorosidad = (condominioId) =>
  api.post("/reportes/morosidad/generar/", { condominio_id: condominioId });

export const getReporteMorosidad = (id) =>
  api.get(`/reportes/morosidad/${id}/`);

export const updateReporteMorosidad = (id, data) =>
  api.put(`/reportes/morosidad/${id}/`, data);

export const deleteReporteMorosidad = (id) =>
  api.delete(`/reportes/morosidad/${id}/`);

export const exportarReporteMorosidad = (id, formato) =>
  api.get(`/reportes/morosidad/${id}/exportar/${formato}/`, {
    responseType: "blob", // necesario para CSV/PDF
  });
