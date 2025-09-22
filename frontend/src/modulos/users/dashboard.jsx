// KoaLanding.jsx
// Plantilla de landing page para "Koa" - gestión de condominios
// Uso: componente React de un solo archivo (export default)
// Requisitos: TailwindCSS instalado en el proyecto Vite.

import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function KoaLanding() {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 font-sans">
      {/* Encabezado */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <figure className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            K
          </figure>
          <div>
            <h1 className="text-lg font-semibold">Koa</h1>
            <p className="text-xs text-slate-500">
              Gestión inteligente de condominios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav aria-label="Navegación principal" className="hidden md:flex gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              Características
            </a>
            <a href="#planes" className="hover:text-slate-900">
              Planes
            </a>
            <a href="#contacto" className="hover:text-slate-900">
              Contacto
            </a>
          </nav>

          <Link
            to={"/login"}
            className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 shadow-sm bg-white hover:shadow-md text-sm"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Hero */}
        <section
          aria-labelledby="hero-title"
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <h2
              id="hero-title"
              className="text-4xl md:text-5xl font-extrabold leading-tight"
            >
              Koa — La plataforma todo-en-uno para administrar tu condominio
            </h2>

            <p className="mt-6 text-lg text-slate-600">
              Controla reservas, incidencias, pagos y la comunicación con
              residentes desde una interfaz simple y segura. Automatiza tareas,
              reduce conflictos y mejora la convivencia.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="#planes"
                className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:opacity-95"
              >
                Comenzar ahora
              </a>
              <a
                href="#features"
                className="inline-block px-6 py-3 rounded-lg border border-slate-200 text-slate-700"
              >
                Ver demo
              </a>
            </div>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
              <li>• Gestión de pagos y cobranzas automatizadas</li>
              <li>• Reservas de áreas comunes</li>
              <li>• Reportes de incidencias y seguimiento</li>
              <li>• Portal de residentes y administrador</li>
            </ul>
          </div>

          <aside className="flex justify-center md:justify-end">
            <figure className="w-[360px] h-[600px] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-white to-slate-50 border border-slate-100">
              <figcaption className="sr-only">Vista previa de la aplicación</figcaption>
              <div className="p-6">
                <div className="w-full h-12 rounded-xl bg-slate-100 mb-4" />
                <div className="w-full h-80 rounded-xl bg-slate-100 mb-4" />
                <div className="space-y-3">
                  <div className="w-full h-4 rounded bg-slate-100" />
                  <div className="w-3/4 h-4 rounded bg-slate-100" />
                  <div className="w-1/2 h-4 rounded bg-slate-100" />
                </div>
              </div>
            </figure>
          </aside>
        </section>

        {/* Características */}
        <section
          id="features"
          aria-labelledby="features-title"
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <h2 id="features-title" className="sr-only">
            Características principales
          </h2>
          {[
            {
              title: "Incidencias y seguimiento",
              desc: "Registra, asigna y cierra incidencias con trazabilidad.",
            },
            {
              title: "Reservas y calendario",
              desc: "Reserva áreas comunes y evita conflictos con reglas claras.",
            },
            {
              title: "Pagos y cobranza",
              desc: "Facturación, recordatorios y conciliación automática.",
            },
          ].map((f) => (
            <article
              key={f.title}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{f.desc}</p>
            </article>
          ))}
        </section>

        {/* Planes */}
        <section id="planes" aria-labelledby="planes-title" className="mt-14">
          <h2 id="planes-title" className="text-2xl font-bold">
            Planes
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-6 bg-white rounded-2xl border border-slate-100">
              <h3 className="font-semibold">Básico</h3>
              <p className="mt-2 text-sm text-slate-600">Para condominios pequeños</p>
              <p className="mt-4 text-3xl font-bold">$19 / mes</p>
              <ul className="mt-4 text-sm text-slate-600 space-y-2">
                <li>• Portal de residentes</li>
                <li>• Reservas</li>
              </ul>
              <button className="mt-6 w-full py-2 rounded-lg bg-indigo-600 text-white">
                Contratar
              </button>
            </article>

            <article className="p-6 bg-white rounded-2xl border border-slate-100 shadow-lg">
              <h3 className="font-semibold">Pro</h3>
              <p className="mt-2 text-sm text-slate-600">Funcionalidades completas</p>
              <p className="mt-4 text-3xl font-bold">$49 / mes</p>
              <ul className="mt-4 text-sm text-slate-600 space-y-2">
                <li>• Todo lo del Básico</li>
                <li>• Gestión de incidencias avanzada</li>
                <li>• Integraciones contables</li>
              </ul>
              <button className="mt-6 w-full py-2 rounded-lg bg-indigo-600 text-white">
                Probar gratis
              </button>
            </article>

            <article className="p-6 bg-white rounded-2xl border border-slate-100">
              <h3 className="font-semibold">Enterprise</h3>
              <p className="mt-2 text-sm text-slate-600">Para administradores profesionales</p>
              <p className="mt-4 text-3xl font-bold">Contactar</p>
              <ul className="mt-4 text-sm text-slate-600 space-y-2">
                <li>• SLA garantizado</li>
                <li>• Onboarding y capacitación</li>
              </ul>
              <button className="mt-6 w-full py-2 rounded-lg border border-slate-200">
                Contactar
              </button>
            </article>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer
        id="contacto"
        aria-labelledby="contacto-title"
        className="mt-20 py-10 border-t border-slate-100"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 id="contacto-title" className="font-semibold">
              ¿Listo para transformar la gestión de tu condominio?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Habla con nuestro equipo o solicita una demo personalizada.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="#"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Solicitar demo
            </a>
            <a href="#" className="px-4 py-2 rounded-lg border">
              Contactar
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} Koa - Todos los derechos reservados.
        </p>
      </footer>

      {/* Modal de login */}
      {openLogin && (
        <div
          role="dialog"
          aria-labelledby="login-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenLogin(false)}
          />

          <section className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h2 id="login-title" className="text-lg font-semibold">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Accede al panel de administración de Koa
            </p>

            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Enviar login (demo)");
              }}
            >
              <div>
                <label className="block text-xs text-slate-600">Correo</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600">Contraseña</label>
                <input
                  type="password"
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="********"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" /> <span>Recordarme</span>
                </label>
                <a href="#" className="text-sm text-indigo-600">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpenLogin(false)}
                  className="flex-1 py-2 rounded-lg border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white"
                >
                  Entrar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
