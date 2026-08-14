import React, { useState } from "react";
import { Scissors, Lock } from "lucide-react";
import { tryLogin } from "./adminAuth.js";

export default function AdminLogin({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (await tryLogin(username, password)) {
        setError("");
        onLoggedIn();
      } else {
        setError("Usuário ou senha incorretos.");
      }
    } catch (err) {
      setError("Não foi possível entrar agora. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-5"
      style={{ background: "#14100D", fontFamily: "'Work Sans', sans-serif", color: "#F2EAD8" }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-[#2E2620] rounded-md bg-[#1D1712] p-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Scissors size={20} className="text-[#C9962C]" />
          <span className="text-xl tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.03em" }}>
            AGBARBEARIA ADMIN
          </span>
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Usuário</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
            />
          </div>
        </div>
        {error && <p className="text-[#E6897B] text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium bg-[#C9962C] text-[#14100D] hover:bg-[#E6B85C] transition-colors disabled:opacity-50"
        >
          <Lock size={16} /> {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
