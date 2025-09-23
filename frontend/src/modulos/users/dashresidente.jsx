import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code"; 
import {
  Menu,
  Bell,
  CreditCard,
  Calendar,
  LogOut,
  User,
  Home,
  Settings,
  ShieldCheck,
  MessageCircle,
  MapPin,
  PlusCircle,
  FileText
} from "lucide-react"; 

// Componente: DashboardResidentes (versión semántica y accesible)
// - Usa landmarks: <header>, <nav>, <main>, <section>, <article>, <footer>
// - Modal con role="dialog" aria-modal y focus-trap básico
// - Fechas con <time datetime="...">
// - Tablas con scope="col"
// - Formularios cuando corresponde (ejemplo de generación QR)

export default function DashResidentes() {
  const [user, setUser] = useState({
    name: "Juan Pérez",
    unit: "Apto 3B",
    email: "juan@example.com",
    phone: "+591 71234567",
    vehicles: [{ plate: "ABC-123" }],
    balance: 120.5
  });

  const [invoices, setInvoices] = useState([
    { id: 1, period: "Ago 2025", amount: 80, status: "Pagado", date: "2025-08-10" },
    { id: 2, period: "Sep 2025", amount: 120.5, status: "Pendiente", date: "2025-09-01" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Asamblea general 30/09 — 18:00 hrs", date: "2025-09-18" },
    { id: 2, text: "Nueva reserva aprobada: Cancha 2 — 2025-09-25 16:00", date: "2025-09-20" }
  ]);

  const [accessHistory, setAccessHistory] = useState([
    { id: 1, type: "Acceso peatonal", when: "2025-09-22T08:12:00", by: "Juan Pérez" },
    { id: 2, type: "Ingreso vehículo", when: "2025-09-21T19:05:00", by: "ABC-123" }
  ]);

  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");

  // Refs para accesibilidad y focus management del modal
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    // Aquí se pueden cargar datos reales desde el backend (ej.: api.get(...))
  }, []);

  // Focus trap y manejo de escape para modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (!showQR) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "Tab") {
        // focus trap básico
        const focusable = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    if (showQR) {
      previouslyFocused.current = document.activeElement;
      setTimeout(() => modalRef.current?.focus(), 0);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // evitar scroll de fondo
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [showQR]);

  function openModal() {
    setShowQR(true);
  }

  function closeModal() {
    setShowQR(false);
    setQrValue("");
  }

  function handleGenerateQR(e, type = "visit") {
    e?.preventDefault();
    const payload = {
      type,
      unit: user.unit,
      user: user.name,
      created_at: new Date().toISOString()
    };
    const value = JSON.stringify(payload);
    setQrValue(value);
    openModal();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="md:flex">
        {/* SIDEBAR NAV */}
        <nav aria-label="sidebar" className="hidden md:flex md:flex-col md:w-64 bg-white border-r shadow-sm">
          <div className="p-4 flex items-center gap-3 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
              {user.name.split(" ")[0][0]}
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-500">{user.unit}</div>
            </div>
          </div>

          <ul className="p-4 flex-1 overflow-auto space-y-2">
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#inicio">
                <Home size={18} /> <span>Inicio</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#pagos">
                <CreditCard size={18} /> <span>Pagos y facturas</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#reservas">
                <Calendar size={18} /> <span>Reservas</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#seguridad">
                <ShieldCheck size={18} /> <span>Seguridad (QR / Accesos)</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#incidencias">
                <FileText size={18} /> <span>Incidencias / Mantenimiento</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#mensajes">
                <MessageCircle size={18} /> <span>Mensajes</span>
              </a>
            </li>
            <li>
              <a className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" href="#perfil">
                <Settings size={18} /> <span>Perfil</span>
              </a>
            </li>
          </ul>

          <div className="p-4 border-t">
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-500 text-white">
              <LogOut size={16} /> <span>Cerrar sesión</span>
            </button>
          </div>
        </nav>

        {/* MAIN AREA */}
        <div className="flex-1 p-4 md:p-6" id="inicio">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded bg-white shadow" aria-label="abrir menú">
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold">Hola, {user.name.split(" ")[0]}</h1>
                <p className="text-sm text-gray-500">Unidad: {user.unit}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded bg-white shadow" aria-label="ver notificaciones">
                <Bell size={18} />
              </button>
              <button className="p-2 rounded bg-white shadow" aria-label="perfil">
                <User size={18} />
              </button>
            </div>
          </header>

          {/* GRID LAYOUT */}
          <main>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column A: Perfil + Acciones */}
              <section aria-labelledby="perfil-title" className="space-y-6">
                <article id="perfil-card" className="bg-white p-4 rounded-2xl shadow-sm" aria-labelledby="perfil-title">
                  <h2 id="perfil-title" className="sr-only">Perfil del residente</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">
                      {user.name.split(" ")[0][0]}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Unidad</div>
                      <div className="font-semibold">{user.unit}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Saldo</div>
                      <div className="font-semibold">${user.balance.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <form onSubmit={(e) => handleGenerateQR(e, "resident")} className="flex-1">
                      <button type="submit" className="w-full py-2 rounded-md bg-cyan-600 text-white flex items-center justify-center gap-2">
                        <ShieldCheck size={16} /> <span>Mostrar QR de residente</span>
                      </button>
                    </form>

                    <button type="button" onClick={() => alert('Ir a pagos (conectar con el back)')} className="flex-1 py-2 rounded-md border">
                      <CreditCard size={16} /> <span>Pagar ahora</span>
                    </button>
                  </div>
                </article>

                <aside aria-labelledby="acciones-title" className="bg-white p-4 rounded-2xl shadow-sm">
                  <h3 id="acciones-title" className="font-semibold">Acciones rápidas</h3>
                  <p className="text-xs text-gray-500">Atajos</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button type="button" className="p-3 rounded-lg bg-gray-50 flex items-center gap-2" onClick={() => alert('Reservar área')}>
                      <Calendar size={18} /> Reservar área
                    </button>
                    <form onSubmit={(e) => handleGenerateQR(e, 'visit')}>
                      <button type="submit" className="p-3 rounded-lg bg-gray-50 flex items-center gap-2">
                        <PlusCircle size={18} /> Generar pase visitante
                      </button>
                    </form>
                    <button type="button" className="p-3 rounded-lg bg-gray-50 flex items-center gap-2" onClick={() => alert('Reportar incidencia')}>
                      <MapPin size={18} /> Reportar incidencia
                    </button>
                    <button type="button" className="p-3 rounded-lg bg-gray-50 flex items-center gap-2" onClick={() => alert('Abrir mensajería')}>
                      <MessageCircle size={18} /> Enviar mensaje
                    </button>
                  </div>
                </aside>

                {/* Mobile notifications */}
                <div className="bg-white p-4 rounded-2xl shadow-sm lg:hidden">
                  <h3 className="font-semibold">Notificaciones</h3>
                  <ul className="mt-3 space-y-2">
                    {notifications.map((n) => (
                      <li key={n.id} className="text-sm text-gray-700">• {n.text}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Column B: Facturas / Movimientos (ocupa 2 columnas) */}
              <section aria-labelledby="facturas-title" className="lg:col-span-2 space-y-6">
                <header className="bg-white p-4 rounded-2xl shadow-sm">
                  <h2 id="facturas-title" className="font-semibold">Facturas recientes</h2>
                  <p className="text-sm text-gray-500">Historial</p>
                </header>

                <article className="bg-white p-4 rounded-2xl shadow-sm" aria-labelledby="tabla-facturas">
                  <h3 id="tabla-facturas" className="sr-only">Tabla de facturas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs text-gray-500">
                        <tr>
                          <th scope="col" className="py-2">Periodo</th>
                          <th scope="col" className="py-2">Fecha</th>
                          <th scope="col" className="py-2">Monto</th>
                          <th scope="col" className="py-2">Estado</th>
                          <th scope="col" className="py-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-t">
                            <td className="py-2">{inv.period}</td>
                            <td className="py-2"><time dateTime={new Date(inv.date).toISOString()}>{inv.date}</time></td>
                            <td className="py-2">${inv.amount.toFixed(2)}</td>
                            <td className="py-2">{inv.status}</td>
                            <td className="py-2">
                              <div className="flex gap-2">
                                <button type="button" className="px-3 py-1 text-sm rounded border" onClick={() => alert('Descargar factura')}>
                                  PDF
                                </button>
                                {inv.status !== "Pagado" && (
                                  <button type="button" className="px-3 py-1 text-sm rounded bg-cyan-600 text-white" onClick={() => alert('Ir a pagar')}>
                                    Pagar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                {/* Accesos / Historial */}
                <article className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Historial de accesos</h3>
                    <p className="text-sm text-gray-500">Últimas 30 entradas</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <ul className="space-y-2">
                        {accessHistory.map((a) => (
                          <li key={a.id} className="p-2 rounded-lg bg-gray-50 flex justify-between">
                            <div>
                              <div className="text-sm font-medium">{a.type}</div>
                              <div className="text-xs text-gray-500"><time dateTime={a.when}>{new Date(a.when).toLocaleString()}</time></div>
                            </div>
                            <div className="text-sm text-gray-600">{a.by}</div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Reservas próximas</div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="text-sm">Cancha 1</div>
                        <div className="text-xs text-gray-500"><time dateTime="2025-09-25T16:00:00">2025-09-25 16:00</time></div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Comunicados / Reportes */}
                <article className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Comunicados recientes</h3>
                    <p className="text-sm text-gray-500">Ver todo</p>
                  </div>

                  <ul className="space-y-2">
                    {notifications.map((n) => (
                      <li key={n.id} className="p-3 rounded-lg bg-gray-50">
                        <div className="text-sm font-medium">{n.text}</div>
                        <div className="text-xs text-gray-500"><time dateTime={new Date(n.date).toISOString()}>{n.date}</time></div>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            </div>
          </main>

          {/* QR Modal */}
          {showQR && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-hidden={!showQR}>
              <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-title"
                tabIndex={-1}
                className="relative bg-white rounded-2xl p-6 shadow-lg max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="qr-title" className="font-semibold">Código QR</h2>
                  <button onClick={closeModal} className="text-gray-500" aria-label="Cerrar diálogo">Cerrar</button>
                </div>

                <figure className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded">
                    <QRCode value={qrValue || "sin-datos"} size={160} />
                  </div>
                  <figcaption className="text-sm text-gray-600 text-center">Presenta este código en la portería o compártelo con tu visitante.</figcaption>
                </figure>

                <div className="w-full flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-md bg-cyan-600 text-white" onClick={() => navigator.share ? navigator.share({ text: qrValue }) : alert('Compartir (no soportado)')}>Compartir</button>
                  <button className="flex-1 py-2 rounded-md border" onClick={() => alert('Descargar (implementar en backend)')}>Descargar</button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile bottom nav (footer landmark) */}
          <footer aria-label="navegacion movil" className="md:hidden">
            <nav aria-label="mobile" className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white rounded-2xl shadow-lg p-2 flex justify-between">
              <a className="flex-1 flex flex-col items-center text-xs" href="#inicio">
                <Home size={18} /> <span>Inicio</span>
              </a>
              <a className="flex-1 flex flex-col items-center text-xs" href="#pagos">
                <CreditCard size={18} /> <span>Pagos</span>
              </a>
              <button className="flex-1 flex flex-col items-center text-xs" onClick={() => handleGenerateQR(null, 'visit')} aria-label="generar pase QR">
                <ShieldCheck size={18} /> <span>QR</span>
              </button>
              <a className="flex-1 flex flex-col items-center text-xs" href="#mensajes">
                <MessageCircle size={18} /> <span>Mensajes</span>
              </a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
