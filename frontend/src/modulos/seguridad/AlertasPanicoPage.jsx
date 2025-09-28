// File: src/modulos/seguridad/AlertasPanicoPage.jsx
import React, { useEffect, useState } from "react";
import { getAlertasPanico, createAlertaPanico, updateAlertaPanico, deleteAlertaPanico } from "../../services/seguridad";

function AlertaForm({ onSubmit, initial = {}, onCancel }){
  const [form, setForm] = useState({ usuario: null, unidad: null, estado: 'activo', ...initial });
  useEffect(()=> setForm(s=>({ ...s, ...initial })), [initial]);
  return (
    <form onSubmit={e=>{ e.preventDefault(); onSubmit(form); }} className="space-y-2">
      <input value={form.estado} onChange={e=>setForm({...form, estado: e.target.value})} placeholder="Estado" className="p-2 border rounded w-full" />
      <div className="flex gap-2">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded">Guardar</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancelar</button>}
      </div>
    </form>
  );
}

export default function AlertasPanicoPage(){
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = async ()=>{ setLoading(true); try{ const res = await getAlertasPanico(); setAlertas(res.data); }catch(e){console.error(e);}finally{setLoading(false);} };
  useEffect(()=>{ fetch() }, []);

  const handleCreate = async (data) => { try{ await createAlertaPanico(data); setCreating(false); fetch(); }catch(e){console.error(e);} };
  const handleUpdate = async (data) => { try{ await updateAlertaPanico(editing.id, data); setEditing(null); fetch(); }catch(e){console.error(e);} };
  const handleDelete = async (id) => { if(!confirm('Eliminar alerta?')) return; try{ await deleteAlertaPanico(id); fetch(); }catch(e){console.error(e);} };

  if(loading) return <div>Cargando alertas...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Alertas de Pánico</h2>
        <button onClick={()=>setCreating(!creating)} className="px-3 py-1 bg-cyan-600 text-white rounded">{creating? 'Cerrar':'Nueva alerta'}</button>
      </div>

      {creating && <AlertaForm onSubmit={handleCreate} onCancel={()=>setCreating(false)} />}

      <table className="w-full text-left">
        <thead><tr className="bg-gray-100"><th className="p-2">Usuario</th><th className="p-2">Unidad</th><th className="p-2">Estado</th><th className="p-2">Creado</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>
          {alertas.map(a=> (
            <tr key={a.id} className="border-b">
              <td className="p-2">{a.usuario?.username ?? a.usuario}</td>
              <td className="p-2">{a.unidad?.numero ?? a.unidad}</td>
              <td className="p-2">{a.estado}</td>
              <td className="p-2">{new Date(a.creado_en).toLocaleString()}</td>
              <td className="p-2 flex gap-2"><button onClick={()=>setEditing(a)} className="px-2 py-1 border rounded">Editar</button><button onClick={()=>handleDelete(a.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (<div className="mt-4"><h3 className="font-semibold">Editar alerta</h3><AlertaForm initial={editing} onSubmit={handleUpdate} onCancel={()=>setEditing(null)} /></div>)}
    </div>
  );
}