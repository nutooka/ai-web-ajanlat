"use client";

import { useEffect, useState } from "react";

export interface OfferClock {
  issuedAt: number;
  /** serverNow - clientNow, so countdowns follow the server's clock. */
  offset: number;
  /** Offer age (minutes) when this page loaded – lets us tell the visitor if a tier expires while they read. */
  ageAtLoad: number;
}

export type OfferClockState =
  | { status: "loading"; clock: null }
  | { status: "ready"; clock: OfferClock }
  | { status: "error"; clock: null };

/** Starts or loads the server-signed offer clock (see /api/offer-clock). */
export function useOfferClock(): OfferClockState {
  const [state, setState] = useState<OfferClockState>({ status: "loading", clock: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offer-clock", { method: "POST" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { issuedAt: number; now: number }) => {
        if (cancelled) return;
        setState({
          status: "ready",
          clock: { issuedAt: data.issuedAt, offset: data.now - Date.now(), ageAtLoad: Math.max(0, (data.now - data.issuedAt) / 60_000) },
        });
      })
      .catch(() => {
        // The server falls back to the first tier, so we never show more than we charge.
        if (!cancelled) setState({ status: "error", clock: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
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
