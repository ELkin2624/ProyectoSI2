// src/modulos/users/registrar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!username || username.trim().length < 3) {
      setError("El usuario debe tener al menos 3 caracteres.");
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Introduce un email válido.");
      return false;
    }
    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
    setError("");
    return true;
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("auth/register/", { username, email, password });

      // Si el backend devuelve tokens (opcional), los guardamos; sino solo redirigimos.
      const access = res.data?.access ?? res.data?.access_token ?? res.data?.tokens?.access;
      const refresh = res.data?.refresh ?? res.data?.refresh_token ?? res.data?.tokens?.refresh;

      if (access && refresh) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      }

      setSuccessMsg("Cuenta creada correctamente. Serás redirigido al inicio de sesión...");
      // redirigir a login (según tu petición)
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "string") setError(data);
        else if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" \n");
          setError(messages);
        } else setError("Error al crear usuario.");
      } else {
        setError("Error de conexión. Intenta más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <aside className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-cyan-600 to-teal-500 text-white">
          <h2 className="text-3xl font-bold">Bienvenido a CondominioApp</h2>
          <p className="mt-3 text-sm opacity-90">Regístrate y gestiona pagos, reservas y accesos desde tu celular.</p>
        </aside>

        <div className="p-6 md:p-10">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">Crea tu cuenta para acceder a los servicios del condominio.</p>
          </header>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <fieldset className="space-y-4 border-0 p-0" aria-labelledby="register-legend">
              <legend id="register-legend" className="sr-only">Formulario de registro</legend>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
                <input id="username" name="username" type="text" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Elige un nombre de usuario" required />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" name="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="tu@ejemplo.com" required />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg border pr-24 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Mínimo 8 caracteres" required aria-describedby="password-help" />
                  <button type="button" aria-pressed={showPassword}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-700 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 focus:outline-none">
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <p id="password-help" className="text-xs text-gray-400 mt-2">Usa una contraseña segura (mínimo 8 caracteres).</p>
              </div>
            </fieldset>

            {error && <p role="alert" aria-live="assertive" className="text-sm text-red-600">{error}</p>}
            {successMsg && <p role="status" className="text-sm text-green-600">{successMsg}</p>}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white ${loading ? 'bg-cyan-300 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loading && (
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                <span>{loading ? 'Creando...' : 'Registrar'}</span>
              </button>

              <Link to="/login" className="text-sm text-gray-600 hover:underline">Ya tengo cuenta</Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">Al registrarte aceptas las políticas del condominio.</p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
