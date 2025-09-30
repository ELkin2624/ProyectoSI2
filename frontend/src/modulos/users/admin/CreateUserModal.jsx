// src/modulos/users/admin/CreateUserModal.jsx
import React, { useState } from "react";
import api from "../../../services/api";

export default function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "residente",
    is_active: true,
    password: "",
    phone: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }
    if (f.size > 6 * 1024 * 1024) {
      setError("Imagen demasiado grande (máx 6MB).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("email", form.email);
      fd.append("role", form.role);
      fd.append("is_active", form.is_active);
      fd.append("phone", form.phone);
      if (form.password) fd.append("password", form.password);
      if (file) fd.append("foto", file);

      const res = await api.post("users/", fd, {
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
        }
      });

      onCreated(res.data); // agregamos usuario a la lista padre
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || err.message || "Error al crear usuario.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-5">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Crear nuevo usuario</h3>
          <button onClick={onClose} className="text-gray-500">Cerrar</button>
        </header>

        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm">Usuario</label>
              <input value={form.username} onChange={e => handleChange("username", e.target.value)} required className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Email</label>
              <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} required className="w-full border px-2 py-1 rounded" />
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-sm">Rol</label>
              <select value={form.role} onChange={e => handleChange("role", e.target.value)} className="border px-2 py-1 rounded">
                <option value="residente">Residente</option>
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
                <option value="junta">Junta Directiva</option>
                <option value="guardia">Guardia</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm">Teléfono</label>
              <input value={form.phone} onChange={e => handleChange("phone", e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-sm">Activo</label>
              <select value={String(form.is_active)} onChange={e => handleChange("is_active", e.target.value === "true")} className="border px-2 py-1 rounded">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm">Contraseña (temporal)</label>
              <input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} className="w-full border px-2 py-1 rounded" placeholder="Dejar vacío para generar automática" />
            </div>
          </div>

          <div>
            <label className="block text-sm">Foto de usuario</label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-24 w-24 border rounded overflow-hidden">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Sin imagen</div>
              )}
            </div>

            <div className="flex-1">
              {progress > 0 && (
                <div className="w-full bg-gray-100 h-2 rounded overflow-hidden mb-2">
                  <div style={{ width: `${progress}%` }} className="h-full bg-cyan-600" />
                </div>
              )}
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
            <button type="submit" className="px-4 py-1 bg-cyan-600 text-white rounded" disabled={loading}>
              {loading ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
