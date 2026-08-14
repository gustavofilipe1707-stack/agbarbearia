import React, { useEffect, useState } from "react";
import { Calendar, Repeat, Check, X, Phone } from "lucide-react";
import { db } from "../firebase.js";
import { collection, onSnapshot, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { WEEKDAYS, fmtPrice, fmtDate } from "./adminUtils.js";

function parseEspKey(id) {
  const [, date, time] = id.split(":");
  return { date, time };
}

function parseFixKey(id) {
  const [, weekday, time] = id.split(":");
  return { weekday: Number(weekday), time };
}

export default function AdminAgenda() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setBookings(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const esporadicos = bookings
    .filter((b) => b.id.startsWith("esp:"))
    .map((b) => ({ ...b, ...parseEspKey(b.id) }))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const fixos = bookings
    .filter((b) => b.id.startsWith("fix:"))
    .map((b) => ({ ...b, ...parseFixKey(b.id) }))
    .sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));

  const marcarAtendido = async (booking, apagarReserva) => {
    setBusyId(booking.id);
    try {
      const dataAtendimento = booking.mode === "esporadico" ? new Date(`${booking.date}T00:00:00`) : new Date();
      await setDoc(doc(collection(db, "historico")), {
        name: booking.name,
        phone: booking.phone || "",
        service: booking.service,
        price: booking.price,
        mode: booking.mode,
        date: dataAtendimento,
        createdAt: serverTimestamp(),
      });
      if (apagarReserva) {
        await deleteDoc(doc(db, "bookings", booking.id));
      }
    } finally {
      setBusyId(null);
    }
  };

  const cancelar = async (booking) => {
    if (!window.confirm(`Cancelar a reserva de ${booking.name}?`)) return;
    setBusyId(booking.id);
    try {
      await deleteDoc(doc(db, "bookings", booking.id));
    } finally {
      setBusyId(null);
    }
  };

  const Row = ({ b, whenLabel }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E2620] py-3">
      <div className="min-w-0">
        <p className="font-medium truncate">{b.name}</p>
        <p className="text-xs text-[#9B9285] flex items-center gap-3 flex-wrap">
          <span>{whenLabel}</span>
          <span>{b.service}</span>
          <span className="font-mono text-[#C9962C]">R$ {fmtPrice(b.price)}</span>
          {b.phone && (
            <span className="flex items-center gap-1">
              <Phone size={11} /> {b.phone}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          disabled={busyId === b.id}
          onClick={() => marcarAtendido(b, b.mode === "esporadico")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-[#C9962C] text-[#C9962C] hover:bg-[#171310] transition-colors disabled:opacity-40"
        >
          <Check size={13} /> Atendido
        </button>
        <button
          disabled={busyId === b.id}
          onClick={() => cancelar(b)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-[#A23B2E] text-[#E6897B] hover:bg-[#171310] transition-colors disabled:opacity-40"
        >
          <X size={13} /> Cancelar
        </button>
      </div>
    </div>
  );

  if (loading) return <p className="text-sm text-[#6b6459]">Carregando agenda…</p>;

  return (
    <div className="space-y-10">
      <section>
        <h3 className="flex items-center gap-2 text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <Calendar size={16} className="text-[#C9962C]" /> HORÁRIOS ESPORÁDICOS ({esporadicos.length})
        </h3>
        {esporadicos.length === 0 ? (
          <p className="text-sm text-[#6b6459]">Nenhum horário esporádico marcado.</p>
        ) : (
          esporadicos.map((b) => <Row key={b.id} b={b} whenLabel={fmtDate(new Date(`${b.date}T00:00:00`)) + " às " + b.time} />)
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <Repeat size={16} className="text-[#A23B2E]" /> HORÁRIOS FIXOS ({fixos.length})
        </h3>
        {fixos.length === 0 ? (
          <p className="text-sm text-[#6b6459]">Nenhum horário fixo marcado.</p>
        ) : (
          fixos.map((b) => <Row key={b.id} b={b} whenLabel={"Toda " + WEEKDAYS[b.weekday] + " às " + b.time} />)
        )}
      </section>
    </div>
  );
}
