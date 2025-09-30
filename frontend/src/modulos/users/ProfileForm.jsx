import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProfileForm() {
  const [profile, setProfile] = useState({ phone: "", foto_url: null, role: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    api.get("profile/")
      .then(r => { if (mounted) setProfile(r.data); })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setMsg("Solo imágenes."); return; }
    if (f.size > 5 * 1024 * 1024) { setMsg("Máx 5MB."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg("");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append("foto", file);
      fd.append("phone", profile.phone || "");

      // Si usaste la recomendación, esto funcionará sin especificar headers
      const res = await api.put("profile/", fd);
      setProfile(res.data);
      setFile(null);
      setPreview(null);
      setMsg("Perfil actualizado.");
      if (file) {
        await api.post("ai/process-face/", fd); // ejemplo; adapta según tu backend
      }
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error al actualizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 max-w-md">
      <div>
        <label>Teléfono</label>
        <input value={profile.phone || ""} onChange={e => setProfile({...profile, phone: e.target.value})} />
      </div>

      <div>
        <label>Foto</label>
        <input type="file" accept="image/*" onChange={onFile} />
      </div>

      <div>
        <label>Vista previa</label>
        <div style={{ width: 120, height: 120, border: "1px solid #ddd" }}>
          {preview ? <img alt="preview" src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   : profile.foto_url ? <img alt="profile" src={profile.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   : <div style={{padding:20}}>Sin imagen</div>}
        </div>
      </div>

      <button type="submit" disabled={loading}>{loading ? "Subiendo..." : "Guardar"}</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}
