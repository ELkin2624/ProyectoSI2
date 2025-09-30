// src/modulos/users/FaceLoginModal.jsx
import React, { useRef, useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function FaceLoginModal({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // preview de captura
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      videoRef.current.srcObject = s;
      await videoRef.current.play();
      setStream(s);
    } catch (err) {
      console.error("No se pudo acceder a la cámara:", err);
      setError("No se pudo acceder a la cámara. Puedes subir una foto en su lugar.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const capture = () => {
    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // ajustar tamaño de salida para reducir peso (ej. 480px de ancho)
    const w = 480;
    const h = Math.round((video.videoHeight / video.videoWidth) * w);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("No se pudo generar la imagen.");
        return;
      }
      // preview local
      const url = URL.createObjectURL(blob);
      setPreview({ blob, url });
    }, "image/jpeg", 0.8); // compresión para bajar peso
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("Imagen demasiado grande (máx 8MB).");
      return;
    }
    setPreview({ blob: f, url: URL.createObjectURL(f) });
  };

  const sendFace = async (blob) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append("foto", blob, "face.jpg");

      const res = await api.post("/face/login/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
        }
      });

      // extraer tokens y rol (igual que tu Login.jsx)
      const access = res.data?.access ?? res.data?.access_token ?? res.data?.tokens?.access;
      const refresh = res.data?.refresh ?? res.data?.refresh_token ?? res.data?.tokens?.refresh;
      const role = res.data?.role ?? res.data?.user?.role ?? "";

      if (access && refresh) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      }

      if (role) localStorage.setItem("role", role);

      // redirección según rol (puedes adaptar)
      if (role === "admin") navigate("/admin");
      else if (role === "residente") navigate("/residente");
      else navigate("/");

    } catch (err) {
      console.error(err);
      // mostrar mensaje amigable según respuesta del backend
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "No se encontró coincidencia.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!preview?.blob) {
      setError("Toma una foto o sube una imagen.");
      return;
    }
    sendFace(preview.blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4">
        <header className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ingresar con rostro</h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-gray-500">Cerrar</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-full bg-black/5 rounded overflow-hidden flex items-center justify-center" style={{ minHeight: 240 }}>
                <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    style={{ display: stream ? 'block' : 'none' }} // Se muestra solo si hay stream
                    playsInline 
                    autoPlay
                    muted
                />
                {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-sm text-gray-500">
                        Cargando cámara...
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-2">
              <button type="button" onClick={capture} className="px-3 py-1 bg-cyan-600 text-white rounded">Capturar</button>
              <button type="button" onClick={startCamera} className="px-3 py-1 border rounded">Reintentar cámara</button>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <label className="block text-sm">Preview / Subir imagen (fallback)</label>
              <input type="file" accept="image/*" onChange={handleFile} />
            </div>

            <div className="h-48 w-full border rounded overflow-hidden flex items-center justify-center">
              {preview?.url ? (
                <img src={preview.url} alt="preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-gray-500">Aquí aparecerá la captura o la imagen subida</div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded">
                {loading ? "Validando..." : "Ingresar con rostro"}
              </button>

              <button onClick={() => { setPreview(null); setError(null); }} className="px-3 py-2 border rounded">Limpiar</button>
            </div>

            {uploadProgress > 0 && (
              <div className="mt-2 w-full bg-gray-100 h-2 rounded overflow-hidden">
                <div style={{ width: `${uploadProgress}%` }} className="h-full bg-cyan-600" />
              </div>
            )}

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
