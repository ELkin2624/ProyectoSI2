import React, { useEffect, useMemo, useState } from "react";
import { Trash, Edit2, PlusCircle, Search, Check, X } from "lucide-react";
import api from "../../services/api"; // ajusta la ruta si tu proyecto la tiene en otro sitio

// ADMIN USERS DASHBOARD
// - Un solo archivo React listo para copiar a: src/pages/AdminUsersDashboard.jsx
// - TailwindCSS (usa la paleta cyan/teal). Responsive y accesible.
// - Dependencias sugeridas: lucide-react (icons). Ya necesitas axios en src/services/api.js
// - CRUD: conectar a endpoints REST (GET /users/, POST /users/, PUT /users/:id, DELETE /users/:id)

// USAGE
// Importa y añade la ruta: <Route path="/admin/users" element={<AdminUsersDashboard/>} />

/*
  NOTAS RÁPIDAS SOBRE ENDPOINTS (ajusta si tu backend usa otro path/shape):
  - GET  /users/              -> [{ id, username, email, role, is_active, created_at }, ...]
  - POST /users/              -> { id, username, email, role, is_active }
  - PUT  /users/:id/          -> { id, username, email, role, is_active }
  - DELETE /users/:id/        -> 204

  Si tu API devuelve un wrapper {results:[], count, next}, ajusta fetchUsers para usar res.data.results.
*/

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      // adjust endpoint/query params as needed
      const params = { search: debouncedQuery, page, page_size: pageSize };
      const res = await api.get("users/", { params });
      // If your API wraps results: res.data.results -> uncomment accordingly
      // setUsers(res.data.results || res.data);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, pageSize]);

  // derived filtered list (if your API doesn't support search server-side)
  const filtered = useMemo(() => {
    if (!debouncedQuery) return users;
    const q = debouncedQuery.toLowerCase();
    return users.filter(u => (u.username || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
  }, [users, debouncedQuery]);

  // Create or update
  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (payload.id) {
        // update
        const res = await api.put(`users/${payload.id}/`, payload);
        setUsers(prev => prev.map(u => (u.id === res.data.id ? res.data : u)));
      } else {
        // create
        const res = await api.post(`users/`, payload);
        setUsers(prev => [res.data, ...prev]);
      }
      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Error al guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`users/${toDelete.id}/`);
      setUsers(prev => prev.filter(u => u.id !== toDelete.id));
      setShowConfirm(false);
      setToDelete(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[80vh] p-4 md:p-6">
      <header className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-cyan-700">Gestión de usuarios</h1>
          <p className="text-sm text-gray-500">Crea, edita y administra los usuarios del sistema.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              placeholder="Buscar usuario o email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-lg border w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="Buscar usuarios"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>

          <button
            onClick={() => { setSelectedUser(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">
            <PlusCircle size={16} /> Nuevo usuario
          </button>
        </div>
      </header>

      <main>
        <section className="bg-white rounded-lg shadow p-3 md:p-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando usuarios...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="py-2">Usuario</th>
                    <th className="py-2 hidden md:table-cell">Email</th>
                    <th className="py-2">Rol</th>
                    <th className="py-2 hidden lg:table-cell">Activo</th>
                    <th className="py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                  ) : filtered.map(user => (
                    <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-gray-400 md:hidden">{user.email}</div>
                      </td>
                      <td className="py-3 hidden md:table-cell">{user.email}</td>
                      <td className="py-3">{user.role ?? "-"}</td>
                      <td className="py-3 hidden lg:table-cell">{user.is_active ? <Check className="text-green-600" /> : <X className="text-red-400" />}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setShowForm(true); }}
                            className="p-2 rounded-md hover:bg-gray-100"
                            title="Editar usuario"
                          ><Edit2 size={16} /></button>

                          <button
                            onClick={() => { setToDelete(user); setShowConfirm(true); }}
                            className="p-2 rounded-md hover:bg-gray-100 text-red-600"
                            title="Eliminar usuario"
                          ><Trash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination & page size control (simple) */}
              <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-gray-500">Mostrando {filtered.length} usuarios</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Por página</label>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="p-1 rounded border">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Form Modal */}
      {showForm && (
        <UserFormModal
          onClose={() => { setShowForm(false); setSelectedUser(null); }}
          onSave={handleSave}
          user={selectedUser}
          saving={saving}
        />
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmDialog
          title={`Eliminar usuario ${toDelete.username}?`}
          message="Esta acción no se puede deshacer."
          onCancel={() => { setShowConfirm(false); setToDelete(null); }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ----------------- UserFormModal -----------------
function UserFormModal({ onClose, onSave, user, saving }) {
  const [form, setForm] = useState({
    id: user?.id ?? null,
    username: user?.username ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "residente",
    is_active: user?.is_active ?? true,
    password: ""
  });

  useEffect(() => {
    setForm({
      id: user?.id ?? null,
      username: user?.username ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "residente",
      is_active: user?.is_active ?? true,
      password: ""
    });
  }, [user]);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    // For create, password is required.
    const payload = { username: form.username, email: form.email, role: form.role, is_active: form.is_active };
    if (form.password) payload.password = form.password;
    if (form.id) payload.id = form.id;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <form onSubmit={submit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{form.id ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Cerrar</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Usuario</label>
            <input value={form.username} onChange={e => handleChange('username', e.target.value)} required className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={form.email} onChange={e => handleChange('email', e.target.value)} type="email" required className="mt-1 w-full p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Rol</label>
              <select value={form.role} onChange={e => handleChange('role', e.target.value)} className="mt-1 w-full p-2 border rounded">
                <option value="residente">Residente</option>
                <option value="admin">Administrador</option>
                <option value="guardia">Guardia</option>
                <option value="empleado">Empleado</option>
                <option value="junta">Junta directiva</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Activo</label>
              <select value={String(form.is_active)} onChange={e => handleChange('is_active', e.target.value === 'true')} className="mt-1 w-full p-2 border rounded">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {!form.id && (
            <div>
              <label className="text-sm font-medium">Contraseña (temporal)</label>
              <input value={form.password} onChange={e => handleChange('password', e.target.value)} type="password" className="mt-1 w-full p-2 border rounded" placeholder="Asignar contraseña" />
              <p className="text-xs text-gray-400 mt-1">Si no ingresas contraseña se generará una automática en backend.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancelar</button>
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded ${saving ? 'bg-cyan-300 cursor-wait' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ----------------- ConfirmDialog -----------------
function ConfirmDialog({ title, message, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
      <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-4 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 rounded border">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 rounded ${loading ? 'bg-red-300 cursor-wait' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
