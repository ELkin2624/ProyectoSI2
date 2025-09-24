// src/modulos/users/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Función de utilidad para detectar si es un email
  const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const validate = () => {
    // Ajustamos la validación para el nuevo campo 'identifier'
    if (!identifier || identifier.trim().length === 0) {
      setError("Por favor, ingresa tu usuario o email.");
      return false;
    }
    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
    setError("");
    return true;
  };

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin");
    //else if (role === "empleado") navigate("/empleado");
    else if (role === "residente") navigate("/residente");
    //else if (role === "junta") navigate("/junta");
    else navigate("/");
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      // 2. Lógica para elegir el endpoint y el payload correctos
      const endpoint = isEmail(identifier)
        ? "auth/login-by-email/"
        : "auth/login/";
        
      const payload = isEmail(identifier)
        ? { email: identifier, password }
        : { username: identifier, password };
      
      console.log(`Intentando login en: ${endpoint}`);

      const res = await api.post(endpoint, payload);

      // extracción robusta de tokens y role
      const access = res.data?.access ?? res.data?.access_token ?? res.data?.tokens?.access;
      const refresh = res.data?.refresh ?? res.data?.refresh_token ?? res.data?.tokens?.refresh;
      const role = res.data?.role ?? res.data?.user?.role ?? "";

      if (access && refresh) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
      }
      if (role) localStorage.setItem("role", role);

      // configurar header por defecto (en caso de usar el mismo api)
      if (access) api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // redirigir según rol (o a / si no viene rol)
      redirectByRole(role);
    } catch (err) {
      console.error(err);
      // mostrar mensajes que pueda venir del backend
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") setError(data);
        else if (typeof data === "object") {
          // si viene {detail: "..."} ó {non_field_errors: [...]}
          if (data.detail) setError(data.detail);
          else {
            const messages = Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" - ");
            setError(messages || "Credenciales inválidas.");
          }
        } else setError("Usuario o contraseña incorrecta.");
      } else if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrecta.");
      } else {
        setError("Error de conexión. Intenta nuevamente más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section aria-labelledby="login-title" className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* left panel */}
        <aside className="hidden md:flex flex-col justify-center items-start p-10 bg-gradient-to-br from-cyan-600 to-teal-500 text-white">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">CondominioApp</h1>
            <p className="mt-2 text-sm opacity-90">Gestión de residentes, pagos y seguridad — todo en un solo lugar.</p>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            <li>• Reservas de áreas comunes</li>
            <li>• Pagos y facturación digital</li>
            <li>• Acceso con QR y control de vehículos</li>
          </ul>
          <footer className="mt-auto text-xs opacity-90">¿Necesitas ayuda? contacta a administración</footer>
        </aside>

        {/* right panel - form */}
        <div className="p-6 md:p-10">
          <header className="mb-6">
            <h2 id="login-title" className="text-2xl font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa con tu cuenta para acceder al panel de residente.</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <fieldset className="space-y-4 border-0 p-0" aria-labelledby="credentials-legend">
              <legend id="credentials-legend" className="sr-only">Credenciales de acceso</legend>

              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Usuario o Email</label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-1 w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ingresa tu usuario o email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg border pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Contraseña"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
            </fieldset>

            {error && <p role="alert" className="text-sm text-red-600" aria-live="assertive">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white ${loading ? 'bg-cyan-300 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loading && (
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
              </button>

              <Link to="/forgot" className="ml-4 text-sm text-gray-600 hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">¿No tienes cuenta? <Link to="/register" className="text-cyan-600 font-medium hover:underline">Regístrate</Link></p>
            </div>
          </form>

          <footer className="mt-6 text-center text-xs text-gray-400">
            <p>Al ingresar aceptas las políticas y reglamentos del condominio.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
