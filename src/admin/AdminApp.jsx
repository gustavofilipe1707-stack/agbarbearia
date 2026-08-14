import React, { useState } from "react";
import { Scissors, CalendarClock, BarChart3, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLogin from "./AdminLogin.jsx";
import AdminAgenda from "./AdminAgenda.jsx";
import AdminRelatorios from "./AdminRelatorios.jsx";
import AdminConfig from "./AdminConfig.jsx";
import { isLoggedIn, logout } from "./adminAuth.js";

const TABS = [
  { key: "agenda", label: "Agenda", icon: CalendarClock, Component: AdminAgenda },
  { key: "relatorios", label: "Relatórios", icon: BarChart3, Component: AdminRelatorios },
  { key: "config", label: "Configurações", icon: Settings, Component: AdminConfig },
];

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [tab, setTab] = useState("agenda");

  if (!loggedIn) {
    return <AdminLogin onLoggedIn={() => setLoggedIn(true)} />;
  }

  const Active = TABS.find((t) => t.key === tab).Component;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#14100D", fontFamily: "'Work Sans', sans-serif", color: "#F2EAD8" }}
    >
      <header className="border-b border-[#2E2620] sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(20,16,13,0.92)" }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scissors size={20} className="text-[#C9962C]" />
            <span className="text-2xl tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.03em" }}>
              AGBARBEARIA
            </span>
            <span className="text-xs text-[#9B9285] uppercase tracking-wide ml-1">Admin</span>
          </Link>
          <button
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
            className="inline-flex items-center gap-2 text-xs text-[#9B9285] hover:text-[#F2EAD8] transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key ? "border-[#C9962C] text-[#F2EAD8]" : "border-transparent text-[#9B9285] hover:text-[#F2EAD8]"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <Active />
      </main>
    </div>
  );
}
