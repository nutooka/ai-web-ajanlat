"use client";

import { useEffect, useState } from "react";

export interface OfferClock {
  issuedAt: number;
  /** serverNow - clientNow, so countdowns follow the server's clock. */
  offset: number;
}

/** Starts or loads the server-signed offer clock (see /api/offer-clock). */
export function useOfferClock(): OfferClock | null {
  const [clock, setClock] = useState<OfferClock | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offer-clock", { method: "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { issuedAt: number; now: number } | null) => {
        if (!cancelled && data) setClock({ issuedAt: data.issuedAt, offset: data.now - Date.now() });
      })
      .catch(() => {
        // Without a clock we keep showing the first tier; the server never charges more than shown.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return clock;
}

/** Current time, refreshed every `intervalMs`; null until mounted. */
export function useNow(intervalMs: number): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}

export function offerAgeMinutesFrom(clock: OfferClock | null, now: number | null): number | undefined {
  if (!clock || now === null) return undefined;
  return Math.max(0, (now + clock.offset - clock.issuedAt) / 60_000);
}

export function formatCountdown(minutes: number): string {
  const totalSeconds = Math.max(0, Math.floor(minutes * 60));
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
