"use client";

import { useSyncExternalStore } from "react";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";

const STORAGE_KEY = "nutooka-offer:v1";

export interface Submission {
  at: number;
  copySent: boolean;
}

export interface WizardSnapshot {
  answers: Answers;
  currentId: string | null;
  packageId: PackageId;
  /** Set after a successful consultation request; cleared when the answers change. */
  submission: Submission | null;
  updatedAt: number;
}

const EMPTY: WizardSnapshot = { answers: {}, currentId: null, packageId: "standard", submission: null, updatedAt: 0 };

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSnapshot: WizardSnapshot = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): WizardSnapshot {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Partial<WizardSnapshot>;
    if (!value || typeof value !== "object" || typeof value.answers !== "object" || value.answers === null) return EMPTY;
    return { ...EMPTY, ...value };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): WizardSnapshot {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: WizardSnapshot | null) {
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / full storage: keep working in memory for this page view.
    cachedRaw = next ? JSON.stringify(next) : null;
    cachedSnapshot = next ?? EMPTY;
  }
  listeners.forEach((listener) => listener());
}

export const wizardStore = {
  update(patch: Partial<Omit<WizardSnapshot, "updatedAt">>) {
    const current = getSnapshot();
    // A changed questionnaire is a new offer: allow a new request.
    const answersChanged = patch.answers !== undefined && JSON.stringify(patch.answers) !== JSON.stringify(current.answers);
    write({ ...current, ...(answersChanged ? { submission: null } : {}), ...patch, updatedAt: Date.now() });
  },
  reset() {
    write(null);
  },
};

/** null during SSR / before hydration, the saved snapshot afterwards. */
export function useWizardSnapshot(): WizardSnapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
