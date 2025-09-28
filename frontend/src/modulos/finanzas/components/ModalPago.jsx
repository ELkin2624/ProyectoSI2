// src/modulos/finanzas/components/ModalPago.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { searchUsers } from "../../../services/users";

/**
 * ModalPago — versión robusta (debounce + autocomplete + inicialización segura)
 *
 * Evita loops de render manteniendo dependencias estables en useEffect.
 */

function parseErrors(err) {
  try {
    const data = err.response?.data;
    if (!data) return { non_field_errors: [err.message || "Error desconocido"] };
    return data;
  } catch {
    return { non_field_errors: [String(err)] };
  }
}

export default function ModalPago({ open, onClose, onSubmit, initial = {}, unidadOptions = [] }) {
  // inicializamos con valores primitivos o strings/nums para evitar re-renders por referencia
  const [form, setForm] = useState({
    factura: initial.factura ?? "",
    unidad: initial.unidad ?? "",
    usuario: initial.usuario ?? "",
    monto: initial.monto ?? "",
    metodo: initial.metodo ?? "cash",
    proveedor_pasarela: initial.proveedor_pasarela ?? "",
    url_comprobante: initial.url_comprobante ?? "",
  });

  const [unidades, setUnidades] = useState(Array.isArray(unidadOptions) ? unidadOptions : []);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Inicializar el formulario SOLO cuando el modal se abre o cambie la factura inicial por ID
  useEffect(() => {
    if (!open) return;
    setForm({
      factura: initial.factura ?? "",
      unidad: initial.unidad ?? "",
      usuario: initial.usuario ?? "",
      monto: initial.monto ?? "",
      metodo: initial.metodo ?? "cash",
      proveedor_pasarela: initial.proveedor_pasarela ?? "",
      url_comprobante: initial.url_comprobante ?? "",
    });
    setErrors({});
    // si initial trae usuario como texto/id, mostrarlo en query opcionalmente
    if (initial.usuario_label) {
      setQuery(initial.usuario_label);
    } else {
      setQuery("");
    }
    setUserResults([]);
    setShowDropdown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial.factura, initial.unidad, initial.monto, initial.usuario]);

  // Mantener unidades sin provocar re-render si no cambian (compara longitud + primeros ids)
  useEffect(() => {
    const incoming = Array.isArray(unidadOptions) ? unidadOptions : [];
    let same = false;
    if (incoming.length === unidades.length) {
      same = incoming.every((u, i) => u?.id === unidades[i]?.id);
    }
    if (!same) setUnidades(incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadOptions]);

  // Manejo click fuera para cerrar dropdown
  useEffect(() => {
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, []);

  // función para buscar usuarios (debounced)
  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setUserResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await searchUsers(q);
      setUserResults(res.data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error buscando usuarios", err);
      setUserResults([]);
      setShowDropdown(false);
    }
  }, []);

  function handleQueryChange(e) {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v.trim()), 350);
  }

  function selectUser(u) {
    setForm(prev => ({ ...prev, usuario: u.id }));
    setQuery(`${u.first_name ? u.first_name + " " : ""}${u.last_name ?? ""} (${u.username})`.trim());
    setShowDropdown(false);
    setUserResults([]);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      if (prev[name] === value) return prev; // evitar setState si no cambia
      return { ...prev, [name]: value };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    // validación mínima
    const newErr = {};
    if (!form.unidad) newErr.unidad = ["Unidad requerida"];
    if (!form.usuario) newErr.usuario = ["Usuario (id) requerido"];
    if (!form.monto) newErr.monto = ["Monto requerido"];
    if (Object.keys(newErr).length) {
      setErrors(newErr);
      return;
    }
    try {
      await onSubmit(form);
      // si todo ok, limpiar y cerrar (el caller suele cerrar)
    } catch (err) {
      const parsed = parseErrors(err);
      setErrors(parsed);
      // re-throw si el caller necesita control (no necesario aquí)
      throw err;
    }
  }

  const fieldError = (field) => {
    const e = errors?.[field];
    if (!e) return null;
    if (Array.isArray(e)) return e.join(" - ");
    return String(e);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-xl p-6" ref={containerRef}>
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Registrar Pago</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Cerrar</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">Factura (id)</label>
            <input name="factura" value={form.factura} onChange={handleChange} className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("factura")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Unidad *</label>
            <select name="unidad" value={form.unidad} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">-- seleccionar --</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad ?? u.nombre ?? u.id}</option>)}
            </select>
            <div className="text-red-600 text-xs mt-1">{fieldError("unidad")}</div>
          </div>

          <div className="relative md:col-span-2">
            <label className="block text-xs mb-1">Usuario (buscar por nombre/email)</label>
            <input
              placeholder="Buscar usuario..."
              value={query}
              onChange={handleQueryChange}
              onFocus={() => { if (userResults.length) setShowDropdown(true); }}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="text-red-600 text-xs mt-1">{fieldError("usuario")}</div>

            {showDropdown && userResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-56 overflow-auto">
                {userResults.map(u => (
                  <li key={u.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectUser(u)}>
                    <div className="text-sm font-medium">{u.first_name ? u.first_name + " " + (u.last_name ?? "") : u.username}</div>
                    <div className="text-xs text-gray-500">{u.email ?? u.username}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-xs mb-1">Monto *</label>
            <input name="monto" value={form.monto} onChange={handleChange} type="number" step="0.01" className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("monto")}</div>
          </div>

          <div>
            <label className="block text-xs mb-1">Método</label>
            <select name="metodo" value={form.metodo} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="bank_transfer">Transferencia</option>
              <option value="link">Link</option>
            </select>
            <div className="text-red-600 text-xs mt-1">{fieldError("metodo")}</div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs mb-1">URL comprobante</label>
            <input name="url_comprobante" value={form.url_comprobante} onChange={handleChange} className="w-full px-3 py-2 border rounded"/>
            <div className="text-red-600 text-xs mt-1">{fieldError("url_comprobante")}</div>
          </div>
        </div>

        <footer className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Registrar Pago</button>
        </footer>
      </form>
    </div>
  );
}
