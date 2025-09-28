// src/services/finanzas.js
import api from "./api"; // mismo api que usas para facilidades

// FACTURAS
export const listFacturas = (params = {}) =>
  api.get("/finanzas/facturas/", { params });

export const getFactura = (id) =>
  api.get(`/finanzas/facturas/${id}/`);

export const createFactura = (data) =>
  api.post("/finanzas/facturas/", data);

export const updateFactura = (id, data) =>
  api.put(`/finanzas/facturas/${id}/`, data);

export const partialUpdateFactura = (id, data) =>
  api.patch(`/finanzas/facturas/${id}/`, data);

export const deleteFactura = (id) =>
  api.delete(`/finanzas/facturas/${id}/`);

// MOROSOS (custom action / endpoint)
export const listMorosos = (params = {}) =>
  api.get("/finanzas/facturas/morosos/", { params });

// PAGOS
export const listPagos = (params = {}) =>
  api.get("/finanzas/pagos/", { params });

export const getPago = (id) =>
  api.get(`/finanzas/pagos/${id}/`);

export const createPago = (data) =>
  api.post("/finanzas/pagos/", data);

export const updatePago = (id, data) =>
  api.put(`/finanzas/pagos/${id}/`, data);

export const deletePago = (id) =>
  api.delete(`/finanzas/pagos/${id}/`);

// CARGOS / ENLACES (helpers)
export const listCargos = (params = {}) =>
  api.get("/finanzas/cargos/", { params });

export const listEnlacesPago = (params = {}) =>
  api.get("/finanzas/enlaces-pago/", { params });

export const pagarFactura = (facturaId, data = {}) =>
  api.post(`/finanzas/facturas/${facturaId}/pagar/`, data);