import React, { useEffect, useMemo, useState } from "react";
import { Scissors, DollarSign, Users, Trophy, Plus, Trash2 } from "lucide-react";
import { db } from "../firebase.js";
import { collection, doc, onSnapshot, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { fmtPrice, fmtDate, toDateInputValue, startOfWeek, endOfWeek, startOfMonth, endOfMonth, normalizeName } from "./adminUtils.js";

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="border border-[#2E2620] rounded-md bg-[#171310] p-4">
      <div className="flex items-center gap-2 text-[#9B9285] text-xs uppercase tracking-wide mb-2">
        <Icon size={14} className="text-[#C9962C]" /> {label}
      </div>
      <p className="text-2xl font-mono text-[#F2EAD8]">{value}</p>
    </div>
  );
}

function HistoricoRow({ h, onDelete }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <span className="truncate flex-1 min-w-0">{h.name}</span>
      <span className="text-[#9B9285] text-xs shrink-0">{h.service}</span>
      <span className="text-xs shrink-0">{fmtDate(h.date)}</span>
      <span className="font-mono text-[#C9962C] shrink-0">R$ {fmtPrice(h.price)}</span>
      <button
        onClick={() => onDelete(h)}
        title="Excluir"
        className="text-[#6b6459] hover:text-[#E6897B] transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function AdminRelatorios() {
  const [historico, setHistorico] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState(toDateInputValue(startOfWeek(new Date())));
  const [dateTo, setDateTo] = useState(toDateInputValue(endOfWeek(new Date())));
  const [clientQuery, setClientQuery] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", serviceId: "", price: "", date: toDateInputValue(new Date()) });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "historico"), (snap) => {
      const list = [];
      snap.forEach((d) => {
        const data = d.data();
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        list.push({ id: d.id, ...data, date });
      });
      list.sort((a, b) => b.date - a.date);
      setHistorico(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "geral"), (snap) => {
      setServices(snap.data()?.services || []);
    });
    return () => unsub();
  }, []);

  const now = useMemo(() => new Date(), []);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const doMes = historico.filter((h) => h.date >= monthStart && h.date <= monthEnd);
  const cortesNoMes = doMes.length;
  const faturamentoNoMes = doMes.reduce((sum, h) => sum + (h.price || 0), 0);
  const clientesUnicosNoMes = new Set(doMes.map((h) => normalizeName(h.name))).size;

  const rangeFrom = new Date(`${dateFrom}T00:00:00`);
  const rangeTo = new Date(`${dateTo}T23:59:59`);
  const noRange = historico.filter((h) => h.date >= rangeFrom && h.date <= rangeTo);

  const porCliente = clientQuery.trim()
    ? historico.filter((h) => normalizeName(h.name).includes(normalizeName(clientQuery)))
    : [];
  const totalPorCliente = porCliente.reduce((sum, h) => sum + (h.price || 0), 0);

  const top10 = useMemo(() => {
    const map = new Map();
    for (const h of historico) {
      const key = normalizeName(h.name);
      if (!key) continue;
      const cur = map.get(key) || { name: h.name, count: 0, total: 0 };
      cur.count += 1;
      cur.total += h.price || 0;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [historico]);
  const maxCount = top10[0]?.count || 1;

  const excluirCorte = async (h) => {
    if (!window.confirm(`Excluir o corte de ${h.name} (${fmtDate(h.date)})?`)) return;
    await deleteDoc(doc(db, "historico", h.id));
  };

  const handleServiceChange = (serviceId) => {
    const s = services.find((x) => x.id === serviceId);
    setForm((f) => ({ ...f, serviceId, price: s ? String(s.price) : f.price }));
  };

  const adicionarCorte = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Informe o nome do cliente.");
      return;
    }
    const service = services.find((s) => s.id === form.serviceId);
    if (!service && !form.price) {
      setFormError("Escolha um serviço ou informe o valor.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "historico"), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        service: service ? service.name : "Outro",
        price: Number(form.price) || 0,
        mode: "manual",
        date: new Date(`${form.date}T12:00:00`),
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", phone: "", serviceId: "", price: "", date: toDateInputValue(new Date()) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[#6b6459]">Carregando relatórios…</p>;

  return (
    <div className="space-y-10">
      <section>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatTile icon={Scissors} label="Cortes no mês" value={cortesNoMes} />
          <StatTile icon={DollarSign} label="Faturamento no mês" value={`R$ ${fmtPrice(faturamentoNoMes)}`} />
          <StatTile icon={Users} label="Clientes atendidos no mês" value={clientesUnicosNoMes} />
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <Plus size={16} className="text-[#C9962C]" /> ADICIONAR CORTE MANUALMENTE
        </h3>
        <form onSubmit={adicionarCorte} className="border border-[#2E2620] rounded-md bg-[#171310] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Nome do cliente</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#14100D] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Telefone (opcional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-[#14100D] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Serviço</label>
              <select
                value={form.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-[#14100D] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
              >
                <option value="">Outro / avulso</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-[#14100D] border border-[#2E2620] rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#C9962C]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-[#14100D] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
              />
            </div>
          </div>
          {formError && <p className="text-[#E6897B] text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#C9962C] text-[#14100D] hover:bg-[#E6B85C] transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> {saving ? "Adicionando…" : "Adicionar corte"}
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          FILTRAR POR PERÍODO
        </h3>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9962C]"
            />
          </div>
          <button
            onClick={() => {
              setDateFrom(toDateInputValue(startOfWeek(new Date())));
              setDateTo(toDateInputValue(endOfWeek(new Date())));
            }}
            className="px-4 py-2 rounded-md text-sm border border-[#2E2620] hover:border-[#4a4034] transition-colors"
          >
            Esta semana
          </button>
          <span className="text-sm text-[#9B9285]">
            {noRange.length} corte(s) · R$ {fmtPrice(noRange.reduce((s, h) => s + (h.price || 0), 0))}
          </span>
        </div>
        <div className="border border-[#2E2620] rounded-md divide-y divide-[#2E2620] max-h-72 overflow-y-auto">
          {noRange.length === 0 ? (
            <p className="text-sm text-[#6b6459] p-4">Nenhum corte nesse período.</p>
          ) : (
            noRange.map((h) => <HistoricoRow key={h.id} h={h} onDelete={excluirCorte} />)
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          BUSCAR POR CLIENTE
        </h3>
        <input
          value={clientQuery}
          onChange={(e) => setClientQuery(e.target.value)}
          placeholder="Nome do cliente"
          className="w-full max-w-sm bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-[#C9962C]"
        />
        {clientQuery.trim() && (
          <>
            <p className="text-sm text-[#9B9285] mb-2">
              {porCliente.length} corte(s) · R$ {fmtPrice(totalPorCliente)} no total
            </p>
            <div className="border border-[#2E2620] rounded-md divide-y divide-[#2E2620] max-h-72 overflow-y-auto">
              {porCliente.length === 0 ? (
                <p className="text-sm text-[#6b6459] p-4">Nenhum atendimento encontrado.</p>
              ) : (
                porCliente.map((h) => <HistoricoRow key={h.id} h={h} onDelete={excluirCorte} />)
              )}
            </div>
          </>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <Trophy size={16} className="text-[#C9962C]" /> TOP 10 CLIENTES
        </h3>
        {top10.length === 0 ? (
          <p className="text-sm text-[#6b6459]">Ainda sem atendimentos registrados.</p>
        ) : (
          <div className="space-y-2.5">
            {top10.map((c, i) => (
              <div key={c.name + i} className="flex items-center gap-3" title={`${c.count} corte(s) · R$ ${fmtPrice(c.total)}`}>
                <span className="w-5 text-xs text-[#6b6459] font-mono shrink-0">{i + 1}</span>
                <span className="w-32 sm:w-40 text-sm truncate shrink-0">{c.name}</span>
                <div className="flex-1 h-2 rounded-full bg-[#2E2620] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C9962C]"
                    style={{ width: `${Math.max(4, (c.count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="w-14 text-xs font-mono text-right shrink-0">{c.count}x</span>
                <span className="w-20 text-xs font-mono text-[#C9962C] text-right shrink-0">R$ {fmtPrice(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
