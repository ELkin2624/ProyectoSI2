// src/modulos/facilidades/Unidades.jsx
import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import api from "../../services/api";
import { list, create, update, remove } from "../../services/facilidades";

const UNIDAD_TIPOS = [
  { value: "departamento", label: "Departamento" },
  { value: "local", label: "Local" },
  { value: "cochera", label: "Cochera" },
];

const UNIDAD_ESTADOS = [
  { value: "ocupado", label: "Ocupado", badge: "bg-red-100 text-red-800" },
  { value: "vacante", label: "Vacante", badge: "bg-green-100 text-green-800" },
  { value: "en_venta", label: "En venta", badge: "bg-blue-100 text-blue-800" },
  { value: "mantenimiento", label: "Mantenimiento", badge: "bg-yellow-100 text-yellow-800" },
];

const STATUS_MAP = Object.fromEntries(UNIDAD_ESTADOS.map(s => [s.value, s]));

function StatusBadge({ estado }) {
  const info = STATUS_MAP[estado] || { label: estado ?? "-", badge: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${info.badge}`}>
      {info.label}
    </span>
  );
}

export default function Unidades() {
  const [items, setItems] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState(null);

  const [form, setForm] = useState({
    numero_unidad: "",
    condominio: "",
    tipo: "departamento",
    estado: "vacante",
    propietario_user: "",
    ocupante_actual_user: "",
    piso: "",
    area_m2: ""
  });

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  // Carga data auxiliar (condominios, usuarios) una vez
  useEffect(() => {
    const fetchAux = async () => {
      try {
        const c = await list("condominios", { page_size: 1000 });
        setCondominios(c.data.results ?? c.data ?? []);
      } catch (err) {
        console.warn("No se pudieron cargar condominios:", err);
      }
      try {
        const u = await api.get("/users/");
        setUsers(u.data.results ?? u.data ?? []);
      } catch (err) {
        console.warn("No se pudieron cargar usuarios:", err);
      }
    };
    fetchAux();
  }, []);

  // Carga unidades cuando cambia la búsqueda o página
  useEffect(() => {
    fetch();
  }, [q, page]);

  const fetch = async (params = {}) => {
    setLoading(true);
    setErrors(null);
    try {
      const res = await list("unidades", { search: q, page, page_size: 10, ...params });
      const data = res.data;
      setItems(data.results ?? data);
      setCount(data.count ?? (data.results ? data.count : (Array.isArray(data) ? data.length : 0)));
    } catch (err) {
      console.error(err);
      setErrors({ general: "Error cargando unidades" });
    } finally {
      setLoading(false);
    }
  };

  const condominioDefault = () => (condominios[0] ? condominios[0].id : "");

  const openCreate = () => {
    setEditing(null);
    setForm({
      numero_unidad: "",
      condominio: condominioDefault(),
      tipo: "departamento",
      estado: "vacante",
      propietario_user: "",
      ocupante_actual_user: "",
      piso: "",
      area_m2: ""
    });
    setErrors(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      numero_unidad: item.numero_unidad ?? "",
      condominio: item.condominio?.id ?? item.condominio ?? "",
      tipo: item.tipo ?? "departamento",
      estado: item.estado ?? "vacante",
      propietario_user: item.propietario_user?.id ?? item.propietario_user ?? "",
      ocupante_actual_user: item.ocupante_actual_user?.id ?? item.ocupante_actual_user ?? "",
      piso: item.piso ?? "",
      area_m2: item.area_m2 ?? ""
    });
    setErrors(null);
    setModalOpen(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.numero_unidad || form.numero_unidad.trim() === "") e.numero_unidad = "Número es requerido";
    if (!form.condominio) e.condominio = "Condominio obligatorio";
    // area_m2 y piso son opcionales, pero si se envían validamos con números
    if (form.area_m2 && isNaN(parseFloat(form.area_m2))) e.area_m2 = "Área debe ser numérica";
    if (form.piso && isNaN(parseInt(form.piso))) e.piso = "Piso debe ser un número";
    return Object.keys(e).length ? e : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    const v = validateForm();
    if (v) {
      setErrors(v);
      return;
    }

    const payload = {
      numero_unidad: form.numero_unidad,
      condominio: form.condominio,
      tipo: form.tipo,
      estado: form.estado,
      propietario_user: form.propietario_user || null,
      ocupante_actual_user: form.ocupante_actual_user || null,
      piso: form.piso === "" ? null : (form.piso === null ? null : parseInt(form.piso)),
      area_m2: form.area_m2 === "" ? null : parseFloat(form.area_m2)
    };

    try {
      if (editing) await update("unidades", editing.id, payload);
      else await create("unidades", payload);
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      // mostrar errores de validación enviados por DRF
      const data = err.response?.data;
      if (data) {
        // convierte objeto de errores a forma usable
        const parsed = {};
        Object.entries(data).forEach(([k, v]) => {
          parsed[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors(parsed);
      } else {
        setErrors({ general: "Error al guardar unidad" });
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar unidad?")) return;
    try {
      await remove("unidades", id);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  // dentro del componente Unidades, antes del return
const getCondominioNombre = (c) => {
  if (!c) return "-";
  // si la API ya devolvió el objeto anidado
  if (typeof c === "object") return c.nombre ?? c.id ?? "-";
  // si es id (string/number) buscamos en el listado cargado
  const found = condominios.find(x => String(x.id) === String(c));
  return found ? (found.nombre ?? String(found.id)) : String(c);
};

const getUserLabel = (u) => {
  if (!u) return "-";
    if (typeof u === "object") {
      // preferimos nombre + apellido, luego username, luego email, y al final el id
      const fullName =
        (u.first_name || u.last_name)
          ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
          : null;

      return (
        fullName ??
        u.username ??
        u.email ??
        (u.id ?? "-")
      );
    }
    // si es id (number/string) buscamos en users cargados
    const found = users.find(x => String(x.id) === String(u));
    if (found) return found.email ?? found.username ?? ((found.first_name || found.last_name) ? `${found.first_name ?? ""} ${found.last_name ?? ""}`.trim() : String(found.id));
      return String(u);
  };

  return (
    <section aria-labelledby="unidades-title" className="p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 id="unidades-title" className="text-2xl font-bold text-gray-800">Unidades</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por número de unidad..."
              aria-label="Buscar unidades"
              className="w-full rounded-full border px-10 py-2 text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md shadow transition">
            <Plus size={16}/> Nuevo
          </button>
        </div>
      </header>

      <main>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y border" role="table">
            <caption className="sr-only">Listado de unidades</caption>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unidad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Condominio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Propietario</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ocupante</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center animate-pulse text-gray-500">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-500">No hay unidades</td></tr>
              ) : items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">{(page-1)*10 + idx + 1}</td>
                  <td className="px-4 py-3 text-sm">{it.numero_unidad}</td>
                  <td className="px-4 py-3 text-sm">{it.condominio_obj?.nombre ?? getCondominioNombre(it.condominio)}</td>
                  <td className="px-4 py-3 text-sm"><StatusBadge estado={it.estado} /></td>
                  <td className="px-4 py-3 text-sm">{getUserLabel(it.propietario_user_obj ?? it.propietario_user)}</td>
                  <td className="px-4 py-3 text-sm">{getUserLabel(it.ocupante_actual_user_obj ?? it.ocupante_actual_user)}</td>
                  <td className="px-4 py-3 text-right text-sm flex justify-end gap-2">
                    <button onClick={() => openEdit(it)} aria-label={`Editar ${it.numero_unidad}`} className="p-2 rounded hover:bg-gray-100 transition"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(it.id)} aria-label={`Eliminar ${it.numero_unidad}`} className="p-2 rounded hover:bg-red-50 text-red-600 transition"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
          <div>Total: {count}</div>
          <div className="flex items-center gap-2">
            <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
            <div className="px-3 py-1 border rounded">Página {page}</div>
            <button onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded border">Siguiente</button>
          </div>
        </div>

      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar unidad" : "Nueva unidad"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Número", key: "numero_unidad", type: "text", required: true },
                  { label: "Piso", key: "piso", type: "number" },
                  { label: "Area (m²)", key: "area_m2", type: "number", step: "0.01" }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                      className="mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:ring-cyan-400 transition"
                      type={field.type}
                      step={field.step}
                      required={field.required}
                    />
                    {errors?.[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
                  </div>
                ))}

                {[
                  { label: "Condominio", key: "condominio", options: condominios, placeholder: "Seleccionar" },
                  { label: "Tipo", key: "tipo", options: UNIDAD_TIPOS },
                  { label: "Estado", key: "estado", options: UNIDAD_ESTADOS },
                  { label: "Propietario", key: "propietario_user", options: users, placeholder: "Sin asignar" },
                  { label: "Ocupante actual", key: "ocupante_actual_user", options: users, placeholder: "Sin asignar" }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <select
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                      className="mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:ring-cyan-400 transition"
                      required={field.key === "condominio"}
                    >
                      <option value="">{field.placeholder ?? "Seleccionar"}</option>
                      {field.options?.map(opt => {
                        if (opt?.nombre) return <option key={opt.id} value={opt.id}>{opt.nombre}</option>;
                        if (opt?.email) return <option key={opt.id} value={opt.id}>{opt.email}</option>;
                        // opciones locales (tipo/estado)
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                      })}
                    </select>
                    {errors?.[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>

              {errors?.general && <div className="text-sm text-red-600">{errors.general}</div>}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white transition">{editing ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
