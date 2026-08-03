"use client";

import { useEffect, useState } from "react";

function timeLeft(target: Date) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Bandeau de promotion — n'apparaît que si l'admin a défini une vraie date de fin, encore à venir. */
export function PromoCountdownBar({ endsAt }: { endsAt: string }) {
  // null tant que non monté côté client : évite un écart d'hydratation SSR/CSR
  // dû au calcul basé sur Date.now().
  const [left, setLeft] = useState<ReturnType<typeof timeLeft>>(null);

  useEffect(() => {
    const target = new Date(endsAt);
    const tick = () => setLeft(timeLeft(target));
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [endsAt]);

  if (!left) return null;

  return (
    <div className="bg-terracotta-600 px-4 py-2 text-center text-sm font-semibold text-white">
      Offre en cours — se termine dans {pad(left.hours)}h {pad(left.minutes)}m {pad(left.seconds)}s
    </div>
  );
}
