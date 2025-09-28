// src/modulos/finanzas/components/ModalForm.jsx
import React, { useEffect, useState } from "react";
import { listUnidades } from "../../../services/facilidades";

function parseErrors(err) {
  // intenta extraer errores de axios / DRF
  try {
    const data = err.response?.data;
    if (!data) return { non_field_errors: [err.message || "Error desconocido"] };
    return data;
  } catch {
    return { non_field_errors: [String(err)] };
  }
}

export default function ModalForm({
  open,
  onClose,
  onSubmit, // debe retornar Promise y rechazar con axios error si hay problemas
  initial = {},
  condominioOptions = [],
  unidadOptions = [],
}) {
  const [form, setForm] = useState({
    condominio: initial.condominio ?? "",
    unidad: initial.unidad ?? "",
    numero_factura: initial.numero_factura ?? "",
    descripcion: initial.descripcion ?? "",
    monto: initial.monto ?? "",
    fecha_vencimiento: initial.fecha_vencimiento ?? "",
    estado: initial.estado ?? "pendiente",
  });

  const [unidades, setUnidades] = useState(unidadOptions || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      condominio: initial.condominio ?? "",
      unidad: initial.unidad ?? "",
      numero_factura: initial.numero_factura ?? "",
      descripcion: initial.descripcion ?? "",
      monto: initial.monto ?? "",
      fecha_vencimiento: initial.fecha_vencimiento ?? "",
      estado: initial.estado ?? "pendiente",
    });
    setUnidades(unidadOptions || []);
    setErrors({});
  }, [initial, unidadOptions, open]);

  useEffect(() => {
    async function fetchUnidades() {
      if (!form.condominio) {
        setUnidades(unidadOptions || []);
        return;
      }
      try {
        const res = await listUnidades({ condominio: form.condominio });
        setUnidades(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
      } catch (err) {
        console.error("Error cargando unidades:", err);
      }
    }
    fetchUnidades();
    // eslint-disable-next-line
  }, [form.condominio]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    // validaciones cliente
    const newErr = {};
    if (!form.numero_factura) newErr.numero_factura = ["N° factura requerido"];
    if (!form.monto) newErr.monto = ["Monto requerido"];
    if (!form.fecha_vencimiento) newErr.fecha_vencimiento = ["Fecha vencimiento requerida"];
    if (!form.condominio) newErr.condominio = ["Condominio requerido"];
    if (Object.keys(newErr).length) {
      setErrors(newErr);
      return;
    }

    // normalizar fecha
    if (form.fecha_vencimiento && form.fecha_vencimiento.includes("T")) {
      form.fecha_vencimiento = form.fecha_vencimiento.split("T")[0];
    }

    try {
      // onSubmit debe retornar una promesa que resuelve si ok o rechaza con error axios
      await onSubmit(form);
      setErrors({});
    } catch (err) {
      const parsed = parseErrors(err);
      setErrors(parsed);
      // no rethrow, permitir mostrar errores inline
    }
  }

  const fieldError = (field) => {
    const e = errors?.[field];
    if (!e) return null;
    if (Array.isArray(e)) return e.join(" - ");
    if (typeof e === "object") return JSON.stringify(e);
    return String(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-2xl p-6">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{initial.id ? "Editar Factura" : "Nueva Factura"}</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Cerrar</button>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">Condominio *</label>
            <select name="condominio" value={form.condominio} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">-- seleccionar --</option>
              {condominioOptions.map(c => <option key={c.id} value={c.id}>{c.nombre ?? c}</option>)}
            </select>
            <div className="text-red-600 text-xs mt-1">{fieldError("condominio")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Unidad</label>
            <select name="unidad" value={form.unidad} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">-- seleccionar --</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad ?? u.nombre ?? u.id}</option>)}
            </select>
            <div className="text-red-600 text-xs mt-1">{fieldError("unidad")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">N° Factura *</label>
            <input name="numero_factura" value={form.numero_factura} onChange={handleChange} className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("numero_factura")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Monto *</label>
            <input name="monto" value={form.monto} onChange={handleChange} type="number" step="0.01" className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("monto")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Fecha Vencimiento *</label>
            <input name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} type="date" className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("fecha_vencimiento")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="pendiente">pendiente</option>
              <option value="pagada">pagada</option>
              <option value="vencida">vencida</option>
            </select>
            <div className="text-red-600 text-xs mt-1">{fieldError("estado")}</div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full px-3 py-2 border rounded" rows="3"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("descripcion")}</div>
          </div>
        </div>

        <footer className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
        </footer>
      </form>
    </div>
  );
}
