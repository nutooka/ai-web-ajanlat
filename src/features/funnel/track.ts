"use client";

import type { FunnelStep } from "./steps";

const SEEN_KEY = "nutooka-funnel";

/** Counts a funnel step once per browser session (no cookies, no personal data). */
export function trackStep(step: FunnelStep): void {
  // Local development shares the production store: keep it out of the numbers.
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return;
  try {
    const seen = new Set<string>(JSON.parse(window.sessionStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
    if (seen.has(step)) return;
    seen.add(step);
    window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Storage blocked: still count, duplicates are acceptable.
  }
  const body = JSON.stringify({ step });
  try {
    if (navigator.sendBeacon?.("/api/funnel", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch("/api/funnel", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}
