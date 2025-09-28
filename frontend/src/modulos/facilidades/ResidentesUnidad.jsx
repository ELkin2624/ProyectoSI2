// src/modulos/facilities/ResidentesUnidad.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash, Search } from "lucide-react";
import { list, create, remove } from "../../services/facilidades";
import api from "../../services/api";

export default function ResidentesUnidad() {
  const [items, setItems] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    unidad: "",
    usuario: "",
    rol: "propietario",
    desde: "",
    hasta: "",
    es_principal: false
  });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [errors, setErrors] = useState(null);

  const fetchAux = async () => {
    try {
      const u = await list("unidades", { page_size: 1000 });
      setUnidades(u.data.results ?? u.data ?? []);
    } catch (err) { console.warn("unidades:", err); setUnidades([]); }
    try {
      const uu = await api.get("/users/?page_size=1000");
      setUsers(uu.data.results ?? uu.data ?? []);
    } catch (err) { console.warn("users:", err); setUsers([]); }
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await list("residentes-unidad", { search: q, page, page_size: 10 });
      const data = res.data;
      setItems(data.results ?? data ?? []);
      setCount(data.count ?? (data.results ? data.count : (Array.isArray(data) ? data.length : 0)));
    } catch (err) {
      console.error(err);
      alert("Error cargando residentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAux();
    fetch();
    // eslint-disable-next-line
  }, [q, page]);

  const unidadesMap = useMemo(() => {
    return Object.fromEntries((unidades || []).map(u => [String(u.id), u]));
  }, [unidades]);

  const usersMap = useMemo(() => {
    return Object.fromEntries((users || []).map(u => [String(u.id), u]));
  }, [users]);

  // Helper: etiqueta de usuario (prioridad: nombre+apellido -> username -> email -> id)
  const getUserLabel = (u) => {
    if (!u) return "-";
    if (typeof u === "object") {
      const fullName = (u.first_name || u.last_name) ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : null;
      return fullName ?? u.username ?? u.email ?? (u.id ?? "-");
    }
    const found = usersMap[String(u)];
    if (found) {
      const fullName = (found.first_name || found.last_name) ? `${found.first_name ?? ""} ${found.last_name ?? ""}`.trim() : null;
      return fullName ?? found.username ?? found.email ?? String(found.id);
    }
    return String(u);
  };

  // Helper: etiqueta unidad
  const getUnidadLabel = (u) => {
    if (!u) return "-";
    if (typeof u === "object") return u.numero_unidad ?? (u.id ?? "-");
    const found = unidadesMap[String(u)];
    return found ? (found.numero_unidad ?? String(found.id)) : String(u);
  };

  // Helper: obtener nombre de condominio desde unidad (puede venir anidado)
  const getCondominioFromUnidad = (u) => {
    if (!u) return "-";
    // si nos pasan el objeto unidad
    if (typeof u === "object") {
      // intenta condominio_obj (serializer enriquecido)
      if (u.condominio_obj && u.condominio_obj.nombre) return u.condominio_obj.nombre;
      // si unidad trae condominio inline
      if (u.condominio && typeof u.condominio === "object" && u.condominio.nombre) return u.condominio.nombre;
      // si condominio es id
      if (typeof u.condominio === "string" || typeof u.condominio === "number") {
        // si el objeto unidad viene con condominio id, fallthrough para buscar en unidadesMap
      }
      return "-";
    }
    // si nos pasan id, buscamos en unidadesMap
    const found = unidadesMap[String(u)];
    if (found) {
      if (found.condominio_obj && found.condominio_obj.nombre) return found.condominio_obj.nombre;
      if (found.condominio && typeof found.condominio === "object" && found.condominio.nombre) return found.condominio.nombre;
      if (found.condominio) return String(found.condominio);
    }
    return String(u);
  };

  const openCreate = () => {
    setErrors(null);
    setForm({
      unidad: unidades[0]?.id ?? "",
      usuario: users[0]?.id ?? "",
      rol: "propietario",
      desde: "",
      hasta: "",
      es_principal: false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);

    const payload = {
      unidad: form.unidad,
      usuario: form.usuario,
      rol: form.rol,
      desde: form.desde || null,
      hasta: form.hasta || null,
      es_principal: !!form.es_principal
    };

    try {
      await create("residentes-unidad", payload);
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data) {
        // parsea errores de backend
        const parsed = {};
        Object.entries(data).forEach(([k, v]) => {
          parsed[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors(parsed);
      } else {
        alert("Error al guardar residente");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar residente?")) return;
    try {
      await remove("residentes-unidad", id);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  return (
    <section aria-labelledby="residentes-title" className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="residentes-title" className="text-2xl font-bold text-gray-800">Residentes por Unidad</h2>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <input
              value={q}
              onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por unidad/usuario..."
              className="rounded-full border px-4 py-2 pl-10 text-sm"
              aria-label="Buscar residentes"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-md shadow"><Plus size={16}/> Nuevo</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Condominio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center">No hay residentes</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{(page-1)*10 + idx + 1}</td>
                <td className="px-4 py-3 text-sm">{ it.unidad_obj?.numero_unidad ?? getUnidadLabel(it.unidad) }</td>
                <td className="px-4 py-3 text-sm">{ it.unidad_obj?.condominio_obj?.nombre ?? getCondominioFromUnidad(it.unidad_obj ?? it.unidad) }</td>
                <td className="px-4 py-3 text-sm">{ it.usuario_obj ? getUserLabel(it.usuario_obj) : getUserLabel(it.usuario) }</td>
                <td className="px-4 py-3 text-sm">{ it.rol }</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button onClick={() => handleDelete(it.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {count}</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border">Anterior</button>
          <div className="px-3 py-1 border rounded">Página {page}</div>
          <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border">Siguiente</button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Nuevo residente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <select required value={form.unidad} onChange={(e)=>setForm({...form, unidad: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {unidades.map(u=> <option key={u.id} value={u.id}>{u.numero_unidad} — {u.condominio_obj?.nombre ?? (u.condominio?.nombre ?? u.condominio)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <select required value={form.usuario} onChange={(e)=>setForm({...form, usuario: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {users.map(u=> <option key={u.id} value={u.id}>
                      {(u.first_name || u.last_name) ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : (u.username ?? u.email)}
                    </option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select value={form.rol} onChange={(e)=>setForm({...form, rol: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                    <option value="ocupante">Ocupante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Es principal</label>
                  <select value={form.es_principal ? "1" : "0"} onChange={(e)=>setForm({...form, es_principal: e.target.value === "1"})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="0">No</option>
                    <option value="1">Sí</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Desde</label>
                  <input type="date" value={form.desde} onChange={(e)=>setForm({...form, desde: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hasta</label>
                  <input type="date" value={form.hasta} onChange={(e)=>setForm({...form, hasta: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
              </div>

              {errors && Object.entries(errors).map(([k,v]) => <div key={k} className="text-sm text-red-600">{k}: {v}</div>)}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-cyan-600 text-white">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
