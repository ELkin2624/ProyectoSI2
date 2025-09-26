// src/modulos/users/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('profile/');
        setProfile(res.data);
      } catch (err) {
        console.error('No se pudo cargar perfil', err);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('profile/', profile);
      setProfile(res.data);
      alert('Perfil actualizado');
    } catch (err) {
      console.error(err);
      alert('Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div>Cargando perfil...</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Mi perfil</h1>
      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Teléfono</label>
          <input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})}
                 className="w-full p-2 border rounded" />
        </div>
        {/* agrega otros campos que tengas en Profile */}
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-cyan-600 text-white">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </main>
  );
}
