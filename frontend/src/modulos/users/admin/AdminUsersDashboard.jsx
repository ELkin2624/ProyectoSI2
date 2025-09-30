// src/modulos/users/admin/AdminUsersDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // para editar
  const [creating, setCreating] = useState(false); // para crear
  const [error, setError] = useState(null);

  // cargar usuarios
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("users/?ordering=id");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // actualizar usuario existente
  const onUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setSelected(null);
  };

  // agregar usuario nuevo
  const onUserCreated = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    setCreating(false);
  };

  return (
    <div className="p-4 min-h-[80vh]">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Usuarios (Admin)</h2>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Crear nuevo usuario
        </button>
      </header>

      {loading ? (
        <div>Cargando usuarios...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-left">Foto</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role || "-"}</td>
                  <td className="px-4 py-2">
                    {u.is_active ? (
                      <span className="text-green-600 font-bold">Sí</span>
                    ) : (
                      <span className="text-red-500 font-bold">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {u.foto_url ? (
                      <img src={u.foto_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">SIN</div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelected(u)}
                      className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {selected && (
        <EditUserModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUserUpdated}
        />
      )}

      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={onUserCreated}
        />
      )}
    </div>
  );
}
