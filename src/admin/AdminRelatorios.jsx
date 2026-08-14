import React, { useEffect, useMemo, useState } from "react";
import { Scissors, DollarSign, Users, Trophy } from "lucide-react";
import { db } from "../firebase.js";
import { collection, onSnapshot } from "firebase/firestore";
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

export default function AdminRelatorios() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState(toDateInputValue(startOfWeek(new Date())));
  const [dateTo, setDateTo] = useState(toDateInputValue(endOfWeek(new Date())));
  const [clientQuery, setClientQuery] = useState("");

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
            noRange.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="truncate">{h.name}</span>
                <span className="text-[#9B9285] text-xs">{h.service}</span>
                <span className="text-xs">{fmtDate(h.date)}</span>
                <span className="font-mono text-[#C9962C]">R$ {fmtPrice(h.price)}</span>
              </div>
            ))
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
                porCliente.map((h) => (
                  <div key={h.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="truncate">{h.name}</span>
                    <span className="text-[#9B9285] text-xs">{h.service}</span>
                    <span className="text-xs">{fmtDate(h.date)}</span>
                    <span className="font-mono text-[#C9962C]">R$ {fmtPrice(h.price)}</span>
                  </div>
                ))
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
