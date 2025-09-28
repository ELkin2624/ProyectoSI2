// File: src/modulos/seguridad/RegistrosAccesoPage.jsx
import React, { useEffect, useState } from "react";
import { getRegistrosAcceso, createRegistroAcceso, deleteRegistroAcceso } from "../../services/seguridad";

function RegistroForm({ onSubmit, initial = {}, onCancel }){
  const [form, setForm] = useState({ punto_acceso: null, usuario: null, vehiculo: null, tipo_evento: 'entrada', ocurrido_en: new Date().toISOString(), ...initial });
  useEffect(()=> setForm(s=>({ ...s, ...initial })), [initial]);
  return (
    <form onSubmit={e=>{ e.preventDefault(); onSubmit(form); }} className="space-y-2">
      <select value={form.tipo_evento} onChange={e=>setForm({...form, tipo_evento: e.target.value})} className="p-2 border rounded w-full">
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
        <option value="denegado">Denegado</option>
      </select>
      <input value={form.ocurrido_en} onChange={e=>setForm({...form, ocurrido_en: e.target.value})} type="datetime-local" className="p-2 border rounded w-full" />
      <div className="flex gap-2">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded">Guardar</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancelar</button>}
      </div>
    </form>
  );
}

export default function RegistrosAccesoPage(){
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetch = async ()=>{ setLoading(true); try{ const res = await getRegistrosAcceso(); setRegistros(res.data); }catch(e){console.error(e);}finally{setLoading(false);} };
  useEffect(()=>{ fetch() }, []);

  const handleCreate = async (data) => { try{ await createRegistroAcceso(data); setCreating(false); fetch(); }catch(e){console.error(e);} };
  const handleDelete = async (id) => { if(!confirm('Eliminar registro?')) return; try{ await deleteRegistroAcceso(id); fetch(); }catch(e){console.error(e);} };

  if(loading) return <div>Cargando registros...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Registros de Acceso</h2>
        <button onClick={()=>setCreating(!creating)} className="px-3 py-1 bg-cyan-600 text-white rounded">{creating? 'Cerrar':'Nuevo registro'}</button>
      </div>

      {creating && <RegistroForm onSubmit={handleCreate} onCancel={()=>setCreating(false)} />}

      <table className="w-full text-left">
        <thead><tr className="bg-gray-100"><th className="p-2">Punto</th><th className="p-2">Usuario</th><th className="p-2">Vehículo</th><th className="p-2">Tipo</th><th className="p-2">Ocurrió en</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>
          {registros.map(r=> (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.punto_acceso?.nombre ?? r.punto_acceso}</td>
              <td className="p-2">{r.usuario?.username ?? r.usuario}</td>
              <td className="p-2">{r.vehiculo?.placa ?? r.vehiculo}</td>
              <td className="p-2">{r.tipo_evento}</td>
              <td className="p-2">{new Date(r.ocurrido_en).toLocaleString()}</td>
              <td className="p-2"><button onClick={()=>handleDelete(r.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}