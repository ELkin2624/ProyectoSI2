// src/modulos/users/admin/EditUserModal.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || "residente");
  const [phone, setPhone] = useState(user.phone || "");
  const [isActive, setIsActive] = useState(user.is_active); // <--- agregamos estado
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user.foto_url || null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role || "residente");
    setPhone(user.phone || "");
    setIsActive(user.is_active); // sincronizamos
    setPreview(user.foto_url || null);
  }, [user]);

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
      fd.append("username", username);
      fd.append("email", email);
      fd.append("role", role);
      fd.append("phone", phone);
      fd.append("is_active", isActive); // <--- ahora se envía
      if (file) fd.append("foto", file);

      const res = await api.put(`users/${user.id}/`, fd, {
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
        }
      });

      onUpdated(res.data);
      onClose(); // cerramos modal automáticamente si quieres
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || err.message || "Error al actualizar usuario.";
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
          <h3 className="text-lg font-semibold">Editar usuario: {user.username}</h3>
          <button onClick={onClose} className="text-gray-500">Cerrar</button>
        </header>

        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm">Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-sm">Rol</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="border px-2 py-1 rounded">
                <option value="residente">Residente</option>
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
                <option value="junta">Junta Directiva</option>
                <option value="guardia">Guardia</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm">Teléfono</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-sm">Estado activo</label>
              <select value={String(isActive)} onChange={e => setIsActive(e.target.value === "true")} className="border px-2 py-1 rounded">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm">Foto de usuario</label>
              <input type="file" accept="image/*" onChange={handleFile} />
            </div>
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
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
