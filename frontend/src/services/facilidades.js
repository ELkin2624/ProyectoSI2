// src/services/facilidades.js
import api from './api'; 

export const list = (resource, params = {}) => api.get(`/facilidades/${resource}/`, { params });
export const retrieve = (resource, id) => api.get(`/facilidades/${resource}/${id}/`);
export const create = (resource, data) => api.post(`/facilidades/${resource}/`, data);
export const update = (resource, id, data) => api.put(`/facilidades/${resource}/${id}/`, data);
export const partialUpdate = (resource, id, data) => api.patch(`/facilidades/${resource}/${id}/`, data);
export const remove = (resource, id) => api.delete(`/facilidades/${resource}/${id}/`);

export const listCondominios = (params = {}) =>
  api.get("/facilidades/condominios/", { params });

export const getCondominio = (id) =>
  api.get(`/facilidades/condominios/${id}/`);

export const listUnidades = (params = {}) =>
  api.get("/facilidades/unidades/", { params });

export const getUnidad = (id) =>
  api.get(`/facilidades/unidades/${id}/`);
export const uploadAdjunto = (formData, config = {}) => {
  return api.post('/facilidades/adjuntos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: config.onUploadProgress,
  });
};
