import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import {
  Menu, Bell, CreditCard, Calendar, LogOut, User, Home, Settings,
  ShieldCheck, MessageCircle, MapPin, PlusCircle, FileText, ChevronLeft, X
} from "lucide-react";
import ProfilePage from "./ProfilePage";

/* ===========================
   Componentes de Secciones
   =========================== */

function ResidentProfileCard({ user, onGenerateQR }) {
  return (
    <article aria-labelledby="perfil-title" className="bg-white p-5 rounded-2xl shadow-sm">
      <h2 id="perfil-title" className="text-lg font-semibold mb-2">Perfil</h2>

      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl"
          aria-hidden
        >
          {user?.name ? user.name.split(" ")[0][0] : "?"}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-lg leading-none">{user?.name ?? "Sin nombre"}</p>
          <p className="text-sm text-gray-500">{user?.unit ?? "Unidad sin asignar"}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">{user?.phone}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <dt className="text-xs text-gray-500">Saldo</dt>
          <dd className="font-semibold">${(user?.balance ?? 0).toFixed(2)}</dd>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <dt className="text-xs text-gray-500">Torre / Unidad</dt>
          <dd className="font-semibold">{user?.unit ?? "-"}</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => onGenerateQR(e, "resident")}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition"
          aria-label="Mostrar código QR"
        >
          <ShieldCheck size={16} /> Mostrar QR
        </button>

        <button
          onClick={() => alert("Ir a pagos (pendiente integrar)")}
          className="px-4 py-2 rounded-md border"
        >
          Pagar ahora
        </button>
      </div>
    </article>
  );
}

function RecentInvoices({ invoices = [] }) {
  return (
    <section aria-labelledby="facturas-title" className="bg-white p-5 rounded-2xl shadow-sm">
      <h2 id="facturas-title" className="text-lg font-semibold">Facturas recientes</h2>

      <ul className="mt-3 space-y-3">
        {invoices.length === 0 ? (
          <li className="text-sm text-gray-500">No hay facturas recientes.</li>
        ) : invoices.map(inv => (
          <li key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div>
              <p className="font-medium">{inv.period} • {inv.description}</p>
              <p className="text-sm text-gray-500">Vencimiento: {inv.dueDate}</p>
            </div>
            <div className="text-right">
              <div className="font-semibold">${inv.amount.toFixed(2)}</div>
              <div className={`text-xs ${inv.paid ? 'text-green-600' : 'text-amber-600'}`}>
                {inv.paid ? 'Pagada' : 'Pendiente'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AccessHistory({ history = [] }) {
  return (
    <section aria-labelledby="historial-title" className="bg-white p-5 rounded-2xl shadow-sm">
      <h3 id="historial-title" className="text-lg font-semibold">Historial de accesos</h3>
      <p className="text-sm text-gray-500 mt-2">Últimas entradas registradas en portería.</p>

      <ol className="mt-3 space-y-2">
        {history.length === 0 ? (
          <li className="text-sm text-gray-500">Sin registros.</li>
        ) : history.map((h, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500" aria-hidden />
            </div>
            <div>
              <p className="text-sm"><strong>{h.who}</strong> — {h.reason}</p>
              <p className="text-xs text-gray-400">{h.at}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* Placeholders para otras secciones (puedes expandirlos) */
const Pagos = ({ invoices = [] }) => (
  <section>
    <h2 className="text-xl font-semibold mb-3">Pagos y facturas</h2>
    <RecentInvoices invoices={invoices} />
  </section>
);

const Reservas = () => (
  <section>
    <h2 className="text-xl font-semibold mb-3">Reservas</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm">Gestión de reservas (próximamente)</div>
  </section>
);

const Seguridad = () => (
  <section>
    <h2 className="text-xl font-semibold mb-3">Seguridad</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm">Control de accesos y visitantes</div>
  </section>
);

const Incidencias = () => (
  <section>
    <h2 className="text-xl font-semibold mb-3">Incidencias</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm">Crear / ver incidencias</div>
  </section>
);

const Mensajes = () => (
  <section>
    <h2 className="text-xl font-semibold mb-3">Mensajes</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm">Bandeja de comunicaciones</div>
  </section>
);

/* ===========================
   Componente Principal
   =========================== */

export default function DashResidentes() {
  // Datos de usuario y cargas iniciales
  const [user, setUser] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [activeKey, setActiveKey] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const modalRef = useRef(null);

  // Datos mock para facturas y historial (reemplázalos por llamados reales)
  const [invoices] = useState([
    { id: 1, period: "Ago 2025", description: "Administración", dueDate: "2025-09-05", amount: 150.00, paid: false },
    { id: 2, period: "Jul 2025", description: "Mantenimiento", dueDate: "2025-08-05", amount: 75.50, paid: true }
  ]);
  const [history] = useState([
    { who: "Juan Pérez", reason: "Entrada principal", at: "2025-09-23 08:12" },
    { who: "Invitado", reason: "Visita al apto 3B", at: "2025-09-22 19:05" }
  ]);

  // Cargar perfil al inicio
  useEffect(() => {
    (async () => {
      try {
        // Si tienes api configurada, descomenta y usa:
        // const res = await api.get('profile/');
        // setUser(res.data);

        // Datos de ejemplo mientras tanto:
        setUser({
          name: "Juan Pérez",
          unit: "Apto 3B",
          email: "juan@example.com",
          phone: "+591 71234567",
          balance: 120.5
        });
      } catch (err) {
        console.error("Error cargando perfil", err);
        setUser({
          name: "Usuario",
          unit: "-",
          email: "-",
          phone: "-",
          balance: 0
        });
      }
    })();
  }, []);

  // Accesibilidad modal QR: manejar Escape y focus trap simple
  useEffect(() => {
    function onKey(e) {
      if (!showQR) return;
      if (e.key === "Escape") closeModal();
    }
    if (showQR) {
      const prev = document.activeElement;
      setTimeout(() => modalRef.current?.focus(), 0);
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
        prev?.focus?.();
      };
    }
  }, [showQR]);

  function openModal() { setShowQR(true); }
  function closeModal() { setShowQR(false); setQrValue(""); }

  function handleGenerateQR(e, type = "visit") {
    e?.preventDefault?.();
    const payload = { type, unit: user?.unit, user: user?.name, created_at: new Date().toISOString() };
    setQrValue(JSON.stringify(payload));
    openModal();
  }

  async function copyQRPayload() {
    try {
      await navigator.clipboard.writeText(qrValue);
      alert("Payload copiado al portapapeles");
    } catch {
      alert("No se pudo copiar");
    }
  }

  function downloadPayload() {
    const blob = new Blob([qrValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-payload-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLogout() {
    // lógica real de logout -> llamar API, limpiar tokens, redirigir
    alert("Cerrando sesión...");
    window.location.href = "/login";
  }

  // Map keys a componentes
  const renderActive = () => {
    switch (activeKey) {
      case "inicio":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="space-y-6 lg:col-span-1">
              <ResidentProfileCard user={user ?? {}} onGenerateQR={handleGenerateQR} />
              {/* Acciones rápidas */}
              <article className="bg-white p-4 rounded-2xl shadow-sm">
                <h4 className="font-semibold mb-2">Acciones rápidas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={(e) => handleGenerateQR(e, "resident")} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                    <ShieldCheck size={16} /> QR de acceso
                  </button>
                  <button onClick={() => setActiveKey("pagos")} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                    <CreditCard size={16} /> Mis facturas
                  </button>
                  <button onClick={() => setActiveKey("incidencias")} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                    <FileText size={16} /> Reportar incidencia
                  </button>
                  <button onClick={() => setActiveKey("mensajes")} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                    <MessageCircle size={16} /> Mensajes
                  </button>
                </div>
              </article>
            </aside>

            <main className="lg:col-span-2 space-y-6">
              <RecentInvoices invoices={invoices} />
              <AccessHistory history={history} />
            </main>
          </div>
        );
      case "pagos":
        return <Pagos invoices={invoices} />;
      case "reservas":
        return <Reservas />;
      case "seguridad":
        return <Seguridad />;
      case "incidencias":
        return <Incidencias />;
      case "mensajes":
        return <Mensajes />;
      case "perfil":
        return <ProfilePage user={user} setUser={setUser} />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  /* ===========================
     JSX principal
     =========================== */

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="md:flex h-screen">
        {/* SIDEBAR */}
        <nav aria-label="Sidebar" className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r p-4 transition-transform md:static md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                {user?.name ? user.name.split(" ")[0][0] : "U"}
              </div>
              <div>
                <p className="font-semibold">{user?.name ?? "Residente"}</p>
                <p className="text-sm text-gray-500">{user?.unit}</p>
              </div>
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
              <X size={20} />
            </button>
          </div>

          <ul className="space-y-2">
            <li>
              <button onClick={() => { setActiveKey("inicio"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'inicio' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <Home size={18} /> Inicio
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("pagos"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'pagos' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <CreditCard size={18} /> Pagos
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("reservas"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'reservas' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <Calendar size={18} /> Reservas
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("seguridad"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'seguridad' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <ShieldCheck size={18} /> Seguridad
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("incidencias"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'incidencias' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <FileText size={18} /> Incidencias
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("mensajes"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'mensajes' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <MessageCircle size={18} /> Mensajes
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveKey("perfil"); setMobileOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition ${activeKey === 'perfil' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                <Settings size={18} /> Perfil
              </button>
            </li>
          </ul>

          <div className="mt-auto pt-4 border-t">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <div className="flex-1 flex flex-col md:ml-64">
          <header className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-md bg-gray-100" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
                <Menu size={18} />
              </button>

              <div>
                <h1 className="text-2xl font-semibold">{activeKey === 'inicio' ? 'Inicio' : activeKey.charAt(0).toUpperCase() + activeKey.slice(1)}</h1>
                <p className="text-sm text-gray-500">Bienvenido, {user?.name?.split(" ")[0] ?? ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                  placeholder="Buscar facturas, reservas..."
                  aria-label="Buscar"
                />
              </div>

              <button className="p-2 rounded bg-white shadow" aria-label="Notificaciones">
                <Bell size={18} />
              </button>

              <button onClick={() => setActiveKey("perfil")} className="p-2 rounded bg-white shadow" aria-label="Mi perfil">
                <User size={18} />
              </button>
            </div>
          </header>

          <main className="p-4 md:p-6 overflow-y-auto">
            {renderActive()}
          </main>
        </div>
      </div>

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-title"
            tabIndex={-1}
            className="relative bg-white rounded-2xl p-6 shadow-lg max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="qr-title" className="font-semibold text-lg">Código QR de acceso</h2>
              <button onClick={closeModal} className="text-gray-500" aria-label="Cerrar diálogo">Cerrar</button>
            </div>

            <figure className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded">
                <QRCode value={qrValue || "sin-datos"} size={160} />
              </div>

              <figcaption className="text-sm text-gray-600 text-center">Presenta este código en la portería.</figcaption>

              <div className="flex gap-2 mt-2 w-full">
                <button onClick={copyQRPayload} className="flex-1 py-2 rounded-md border">Copiar payload</button>
                <button onClick={downloadPayload} className="flex-1 py-2 rounded-md bg-gray-800 text-white">Descargar</button>
              </div>

              <details className="w-full mt-2">
                <summary className="text-sm text-gray-500 cursor-pointer">Ver datos del payload</summary>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-2 break-words max-h-40 overflow-auto">{qrValue}</pre>
              </details>
            </figure>
          </div>
        </div>
      )}
    </div>
  );
}
