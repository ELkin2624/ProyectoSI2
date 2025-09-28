import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo,
} from "../../services/seguridad";

const tryFetchList = async (paths) => {
  for (const p of paths) {
    try {
      const res = await api.get(p);
      if (res.status === 200 && Array.isArray(res.data)) return res.data;
      if (res.status === 200 && Array.isArray(res.data.results)) return res.data.results;
    } catch (e) {
      // sigue intentando
    }
  }
  return [];
};

function VehiculoForm({
  form,          
  handleChange,  
  handleSubmit,  
  onCancel,
  users = [],
  condominios = [],
  unidades = [],
  errors = null,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-3 rounded">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={form.placa}
          onChange={(e) => handleChange("placa", e.target.value)}
          placeholder="Placa"
          className="p-2 border rounded"
        />
        <input
          value={form.marca}
          onChange={(e) => handleChange("marca", e.target.value)}
          placeholder="Marca"
          className="p-2 border rounded"
        />
        <input
          value={form.modelo}
          onChange={(e) => handleChange("modelo", e.target.value)}
          placeholder="Modelo"
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={form.color}
          onChange={(e) => handleChange("color", e.target.value)}
          placeholder="Color"
          className="p-2 border rounded"
        />

        <select
          value={form.condominio}
          onChange={(e) => handleChange("condominio", e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">-- Seleccionar Condominio --</option>
          {condominios.map((c) => {
            const id = c.id ?? c.pk ?? "";
            const label = c.nombre ?? c.title ?? `Condominio #${id}`;
            return (
              <option key={id || Math.random()} value={String(id)}>
                {label}
              </option>
            );
          })}
        </select>

        <select
          value={form.unidad}
          onChange={(e) => handleChange("unidad", e.target.value)}
          className="p-2 border rounded"
          disabled={!form.condominio || unidades.length === 0}
        >
          <option value="">-- Seleccionar Unidad --</option>
          {unidades.map((u) => {
            const id = u.id ?? u.pk ?? "";
            const label = u.numero_unidad ?? u.nombre ?? `Unidad #${id}`;
            return (
              <option key={id || Math.random()} value={String(id)}>
                {label}
              </option>
            );  
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select
          value={form.usuario}
          onChange={(e) => handleChange("usuario", e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">-- Usuario --</option>
          {users.map((u) => {
            const id = u.id ?? u.pk ?? "";
            const label = u.username ?? u.email ?? `#${id}`;
            return (
              <option key={id || Math.random()} value={String(id)}>
                {label}
              </option>
            );
          })}
        </select>

        <div className="flex items-center gap-2">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded">Guardar</button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {errors && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded">
          {Object.entries(errors).map(([k, v]) => (
            <div key={k}>
              <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : String(v)}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const initialFormState = {
    placa: "", marca: "", modelo: "", color: "",
    usuario: "", unidad: "", condominio: "",
  };
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState(null);

  const getIdString = (v) => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "object") return String(v.id ?? v.pk ?? "");
    return String(v);
  };

  const handleFormChange = (key, value) => {
    setErrors(null);
    if (key === "condominio") {
      setForm((prev) => ({ ...prev, [key]: value, unidad: "" }));
      // Solo llamar si el value no está vacío
      if (value) fetchUnidadesByCondominio(value);
      else setUnidades([]);
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await getVehiculos();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setVehiculos(data);
    } catch (err) {
      console.error("Error fetching vehiculos:", err);
      alert("Error al cargar vehículos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const [usersList, condominiosList] = await Promise.all([
        tryFetchList(["users/", "usuarios/", "auth/users/"]),
        tryFetchList(["facilidades/condominios/", "condominios/"]),
      ]);
      setUsers(usersList);
      setCondominios(condominiosList);
    } catch (err) {
      console.warn("No se pudieron cargar users/condominios", err);
    }
  };

  const fetchUnidadesByCondominio = async (condominioId) => {
    if (!condominioId) {
      setUnidades([]);
      return;
    }
    try {
      const res = await api.get(`facilidades/unidades/?condominio=${condominioId}`);
      if (res.status === 200) {
        const raw = res.data.results ?? res.data ?? [];
        const normalized = raw.map(u => ({
          id: u.id ?? u.pk ?? (u.pk_id ?? ""), // intenta varios nombres posibles
          numero_unidad: u.numero_unidad ?? u.nombre ?? u.numero ?? String(u.id ?? u.pk ?? ""),
          ...u
        }));
        setUnidades(normalized);
      }
    } catch (e) {
      console.warn(`No se pudo cargar unidades para condominio ${condominioId}`, e);
      setUnidades([]);
    }
  };
  
  useEffect(() => {
    fetchVehiculos();
    fetchLists();
  }, []);

  useEffect(() => {
    if (editing) {
      const initialCondominio = (editing.unidad && (editing.unidad.condominio?.id ?? editing.unidad.condominio)) || editing.condominio || "";
      setForm({
        placa: editing.placa ?? "",
        marca: editing.marca ?? "",
        modelo: editing.modelo ?? "",
        color: editing.color ?? "",
        usuario: getIdString(editing.usuario),
        unidad: getIdString(editing.unidad),
        condominio: getIdString(initialCondominio),
      });
      if (initialCondominio) {
        fetchUnidadesByCondominio(getIdString(initialCondominio));
      }
      setCreating(false); 
    } else {
        setForm(initialFormState);
        setUnidades([]); 
    }
  }, [editing]);

  const handleToggleCreate = () => {
    setCreating(!creating);
    setEditing(null); // Cierra edición si se abre creación
    setForm(initialFormState); // Resetea el formulario
    setUnidades([]); // Limpia las unidades
    setErrors(null);
  };
  
  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setErrors(null);

    if (!form.placa || form.placa.trim() === "") {
        setErrors({ placa: ["La placa es obligatoria."] });
        return;
    }
    if (!form.unidad) {
        setErrors({ unidad: ["Debes seleccionar una unidad."] });
        return;
    }
    
    const payload = {
        placa: form.placa.trim(), 
        marca: form.marca,
        modelo: form.modelo,
        color: form.color,
    };

    // Convertir y validar unidad
    const unidadNum = Number(form.unidad);
    if (Number.isNaN(unidadNum) || unidadNum <= 0) {
      setErrors({ unidad: ["Unidad inválida. Selecciona una unidad válida."] });
      return;
    }
    payload.unidad = unidadNum;

    if (form.usuario) {
        payload.usuario = Number(form.usuario);
        if (!Number.isNaN(usuarioNum) && usuarioNum > 0) payload.usuario = usuarioNum;
    } 

    try {
      console.log("Payload que se enviará a la API:", payload);
      await action(payload);
    } catch (err) {
        if (err?.response?.data) {
            setErrors(err.response.data);
        } else {
            setErrors({ non_field_errors: [err.message ?? "Error inesperado"] });
        }
    }
  };

  const handleCreate = async (data) => {
    await createVehiculo(data);
    setCreating(false);
    await fetchVehiculos();
    alert("Vehículo creado correctamente");
  };

  const handleUpdate = async (data) => {
    await updateVehiculo(editing.id, data);
    setEditing(null);
    await fetchVehiculos();
    alert("Vehículo actualizado");
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar vehículo?")) return;
    try {
      await deleteVehiculo(id);
      await fetchVehiculos();
      alert("Vehículo eliminado");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error eliminando vehículo. Revisa la consola.");
    }
  };

  if (loading) return <div>Cargando vehículos...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center mb-0">
        <h2 className="text-lg font-semibold">Vehículos</h2>
        <div>
          <button onClick={handleToggleCreate} className="px-3 py-1 bg-cyan-600 text-white rounded">
            {creating ? "Cerrar formulario" : "Nuevo vehículo"}
          </button>
        </div>
      </div>
      
      {/* Formulario de creación */}
      {creating && (
        <VehiculoForm
          form={form}
          handleChange={handleFormChange}
          handleSubmit={(e) => handleSubmit(e, handleCreate)}
          onCancel={handleToggleCreate}
          users={users}
          condominios={condominios}
          unidades={unidades}
          errors={errors}
        />
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left mt-4 border-collapse">
          <thead />
          <tbody>
            {vehiculos.map((v) => (
              <React.Fragment key={v.id}>
                <tr className="border-b">
                  <td className="p-2">{v.placa}</td>
                  <td className="p-2">{v.marca}</td>
                  <td className="p-2">{v.modelo}</td>
                  <td className="p-2">{v.color}</td>
                  <td className="p-2">{v.usuario?.username ?? v.usuario ?? "-"}</td>
                  <td className="p-2">{v.unidad?.numero_unidad ?? v.unidad ?? "-"}</td>
                  <td className="p-2">{v.unidad?.condominio?.nombre ?? "-"}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => setEditing(v)} className="px-2 py-1 border rounded">Editar</button>
                    <button onClick={() => handleDelete(v.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
                  </td>
                </tr>

                {/* Formulario de edición (aparece debajo de la fila) */}
                {editing && editing.id === v.id && (
                  <tr>
                    <td colSpan="8" className="p-0">
                        <VehiculoForm
                          form={form}
                          handleChange={handleFormChange}
                          //handleSubmit={(e) => handleSubmit(e, (data) => handleUpdate(data))}
                          handleSubmit={(e) => handleSubmit(e, handleUpdate)}
                          onCancel={() => setEditing(null)}
                          users={users}
                          condominios={condominios}
                          unidades={unidades}
                          errors={errors}
                        />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}