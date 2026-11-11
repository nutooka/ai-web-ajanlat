"use client";

import { useEffect, useState } from "react";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";

/** Same snapshot, any key order → same key, so a re-render with a re-ordered object never posts again. */
function stableKey(answers: Answers, packageId: PackageId, tier: number): string {
  const sorted = Object.keys(answers)
    .sort()
    .map((id) => [id, answers[id]]);
  return JSON.stringify([sorted, packageId, tier]);
}

/** Codes this page view already got (the server's code for a snapshot never changes). Short-lived, so a revisited snapshot is refreshed now and then. */
const CACHE_MS = 5 * 60 * 1000;
const known = new Map<string, { code: string; at: number }>();

function cached(key: string): string | null {
  const hit = known.get(key);
  return hit && Date.now() - hit.at < CACHE_MS ? hit.code : null;
}

/**
 * Short code + link for the current offer, so a screenshot or a message always leads back to all answers.
 * Posts only when the snapshot (answers, package, discount tier) really changed and its code is not known yet.
 */
export function useOfferCode(answers: Answers, packageId: PackageId, tier: number, enabled = true): string | null {
  const [result, setResult] = useState<{ key: string; code: string | null } | null>(null);
  // The discount tier is part of the key: when it changes, the screen changes, so does the code.
  const key = stableKey(answers, packageId, tier);
  const fromCache = enabled ? cached(key) : null;

  useEffect(() => {
    if (!enabled || cached(key)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const [sorted, watchedPackage] = JSON.parse(key) as [[string, unknown][], PackageId];
      fetch("/api/offer-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: Object.fromEntries(sorted), packageId: watchedPackage }),
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { ok?: boolean; code?: string } | null) => {
          const code = body?.ok && body.code ? body.code : null;
          if (code) known.set(key, { code, at: Date.now() });
          setResult({ key, code });
        })
        .catch(() => undefined);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, enabled]);

  if (fromCache) return fromCache;
  return result?.key === key ? result.code : null;
}

export function offerLink(code: string, origin = typeof window === "undefined" ? "" : window.location.origin): string {
  return `${origin}/a/${code}`;
}
