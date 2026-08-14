import React, { useEffect, useState } from "react";
import { Save, Lock, Unlock } from "lucide-react";
import { db } from "../firebase.js";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const SETTINGS_REF = ["settings", "geral"];

export default function AdminConfig() {
  const [services, setServices] = useState([]);
  const [agendaAberta, setAgendaAberta] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, ...SETTINGS_REF), (snap) => {
      const data = snap.data();
      if (data) {
        setServices(data.services || []);
        setAgendaAberta(data.agendaAberta !== false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updatePrice = (id, price) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price: Number(price) || 0 } : s)));
  };

  const salvar = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, ...SETTINGS_REF), { services, agendaAberta }, { merge: true });
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  const toggleAgenda = async () => {
    const novoValor = !agendaAberta;
    setAgendaAberta(novoValor);
    await setDoc(doc(db, ...SETTINGS_REF), { agendaAberta: novoValor }, { merge: true });
  };

  if (loading) return <p className="text-sm text-[#6b6459]">Carregando configurações…</p>;

  return (
    <div className="space-y-10 max-w-xl">
      <section>
        <h3 className="text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          AGENDA
        </h3>
        <div className="border border-[#2E2620] rounded-md bg-[#171310] p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{agendaAberta ? "Agenda aberta" : "Agenda fechada"}</p>
            <p className="text-xs text-[#9B9285]">
              {agendaAberta ? "Clientes conseguem marcar horário no site." : "O site mostra que não está aceitando agendamentos."}
            </p>
          </div>
          <button
            onClick={toggleAgenda}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              agendaAberta ? "border border-[#A23B2E] text-[#E6897B] hover:bg-[#1D1712]" : "bg-[#C9962C] text-[#14100D] hover:bg-[#E6B85C]"
            }`}
          >
            {agendaAberta ? (
              <>
                <Lock size={15} /> Fechar
              </>
            ) : (
              <>
                <Unlock size={15} /> Abrir
              </>
            )}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          TABELA DE PREÇOS
        </h3>
        <div className="border-t border-[#2E2620]">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3 border-b border-[#2E2620] gap-3">
              <div className="min-w-0">
                <p className="text-sm truncate">{s.name}</p>
                {s.note && <p className="text-[11px] text-[#6b6459] italic truncate">{s.note}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm text-[#9B9285]">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={s.price}
                  onChange={(e) => updatePrice(s.id, e.target.value)}
                  className="w-24 bg-[#171310] border border-[#2E2620] rounded-md px-2 py-1.5 text-sm font-mono text-right focus:outline-none focus:border-[#C9962C]"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={salvar}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium bg-[#C9962C] text-[#14100D] hover:bg-[#E6B85C] transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Salvando…" : "Salvar preços"}
          </button>
          {savedAt && <span className="text-xs text-[#9B9285]">Salvo às {savedAt.toLocaleTimeString("pt-BR")}</span>}
        </div>
      </section>
    </div>
  );
}
