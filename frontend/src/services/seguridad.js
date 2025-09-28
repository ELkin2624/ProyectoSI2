// File: src/services/seguridad.js
import api from "./api";

// Vehículos — usa las rutas estándar del router de DRF
export const getVehiculos = () => api.get("vehiculos/");
export const getVehiculo = (id) => api.get(`vehiculos/${id}/`);
export const createVehiculo = (data) => api.post("vehiculos/", data);
export const updateVehiculo = (id, data) => api.put(`vehiculos/${id}/`, data);
export const partialUpdateVehiculo = (id, data) => api.patch(`vehiculos/${id}/`, data);
export const deleteVehiculo = (id) => api.delete(`vehiculos/${id}/`);

// Puntos de acceso
export const getPuntosAcceso = () => api.get("seguridad/puntos-acceso/");
export const getPuntoAcceso = (id) => api.get(`seguridad/puntos-acceso/${id}/`);
export const createPuntoAcceso = (data) => api.post("seguridad/puntos-acceso/", data);
export const updatePuntoAcceso = (id, data) => api.put(`seguridad/puntos-acceso/${id}/`, data);
export const deletePuntoAcceso = (id) => api.delete(`seguridad/puntos-acceso/${id}/`);

// Registros de acceso
export const getRegistrosAcceso = () => api.get("seguridad/registros-acceso/");
export const createRegistroAcceso = (data) => api.post("seguridad/registros-acceso/", data);
export const getRegistroAcceso = (id) => api.get(`seguridad/registros-acceso/${id}/`);
export const updateRegistroAcceso = (id, data) => api.put(`seguridad/registros-acceso/${id}/`, data);
export const deleteRegistroAcceso = (id) => api.delete(`seguridad/registros-acceso/${id}/`);

// Detecciones de placas
export const getDeteccionesPlacas = () => api.get("seguridad/detecciones-placas/");
export const getDeteccionPlaca = (id) => api.get(`seguridad/detecciones-placas/${id}/`);
export const createDeteccionPlaca = (data) => api.post("seguridad/detecciones-placas/", data);
export const deleteDeteccionPlaca = (id) => api.delete(`seguridad/detecciones-placas/${id}/`);

// Detecciones de rostros
export const getDeteccionesRostros = () => api.get("seguridad/detecciones-rostros/");
export const getDeteccionRostro = (id) => api.get(`seguridad/detecciones-rostros/${id}/`);
export const createDeteccionRostro = (data) => api.post("seguridad/detecciones-rostros/", data);
export const deleteDeteccionRostro = (id) => api.delete(`seguridad/detecciones-rostros/${id}/`);

// Alertas de pánico
export const getAlertasPanico = () => api.get("seguridad/alertas-panico/");
export const getAlertaPanico = (id) => api.get(`seguridad/alertas-panico/${id}/`);
export const createAlertaPanico = (data) => api.post("seguridad/alertas-panico/", data);
export const updateAlertaPanico = (id, data) => api.put(`seguridad/alertas-panico/${id}/`, data);
export const deleteAlertaPanico = (id) => api.delete(`seguridad/alertas-panico/${id}/`);

// Registros de seguridad (turnos)
export const getRegistrosSeguridad = () => api.get("seguridad/registros-seguridad/");
export const createRegistroSeguridad = (data) => api.post("seguridad/registros-seguridad/", data);
export const updateRegistroSeguridad = (id, data) => api.put(`seguridad/registros-seguridad/${id}/`, data);
export const deleteRegistroSeguridad = (id) => api.delete(`seguridad/registros-seguridad/${id}/`);