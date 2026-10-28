"use client";

import { useEffect, useState } from "react";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";

/** Short code + link for the current offer, so a screenshot or a message always leads back to all answers. */
export function useOfferCode(answers: Answers, packageId: PackageId, tier: number, enabled = true): string | null {
  const [result, setResult] = useState<{ key: string; code: string | null } | null>(null);
  // The discount tier is part of the key: when it changes, the screen changes, so does the code.
  const key = JSON.stringify([answers, packageId, tier]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const [watchedAnswers, watchedPackage] = JSON.parse(key) as [Answers, PackageId];
      fetch("/api/offer-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: watchedAnswers, packageId: watchedPackage }),
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { ok?: boolean; code?: string } | null) => setResult({ key, code: body?.ok && body.code ? body.code : null }))
        .catch(() => undefined);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, enabled]);

  return result?.key === key ? result.code : null;
}

export function offerLink(code: string, origin = typeof window === "undefined" ? "" : window.location.origin): string {
  return `${origin}/a/${code}`;
}
