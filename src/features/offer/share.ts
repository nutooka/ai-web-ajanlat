import { createHmac } from "node:crypto";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import { PACKAGE_IDS, type PackageId } from "@/features/pricing/types";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { kvCommand, kvFromEnv, type Kv } from "@/lib/kv";
import { purposeKey } from "@/lib/secrets";

/**
 * Offer code: a short id for exactly what the visitor saw – answers (incl. the deadline slider),
 * package and the quick-decision discount tier at that moment. Any change gives a new code,
 * so a screenshot's code always opens the same prices. Kept for 180 days, without contact data.
 */
const SHARE_TTL_SECONDS = 180 * 24 * 60 * 60;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
const CODE_LENGTH = 8;
/** New codes have 8 characters; links with the older 6-character codes keep working. */
const CODE_PATTERN = /^(?:[A-HJ-NP-Z2-9]{6}|[A-HJ-NP-Z2-9]{8})$/;
/** Collisions are astronomically rare (32^8 codes); after this many the save gives up. */
const MAX_CODE_ATTEMPTS = 5;

export interface SharedOffer {
  answers: Answers;
  packageId: PackageId;
  /** When this exact screen was last shown. */
  createdAt: number;
  /** Server-verified offer age (minutes) at that moment – freezes the discounts and countdown. null = unknown (old links). */
  ageMinutes: number | null;
}

/** Discount tier the visitor saw: part of the code, so a different tier is a different snapshot. */
function quickPercentAt(ageMinutes: number | null): number {
  return resolveQuickDecision(pricingConfig.discounts.quickDecision, ageMinutes ?? undefined).percent;
}

function canonical(answers: Answers, packageId: PackageId, quickPercent: number): string {
  const sorted = Object.fromEntries(Object.entries(answers).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ a: sorted, p: packageId, q: quickPercent });
}

/** Deterministic code for a snapshot; `attempt` > 0 gives the alternative codes used after a collision. */
export function offerCode(answers: Answers, packageId: PackageId, secret: string, quickPercent = 0, attempt = 0): string {
  const content = canonical(answers, packageId, quickPercent);
  const digest = createHmac("sha256", purposeKey(secret, "share"))
    .update(attempt === 0 ? content : `${content}#${attempt}`)
    .digest();
  // 32 symbols = 5 bits per byte, so `% 32` has no bias.
  return Array.from(digest.subarray(0, CODE_LENGTH), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function normalizeCode(input: string): string | null {
  const code = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return CODE_PATTERN.test(code) ? code : null;
}

/** Validates untrusted input; null when it is not a complete questionnaire. */
export function parseShareInput(input: unknown): { answers: Answers; packageId: PackageId } | null {
  if (!input || typeof input !== "object") return null;
  const { answers: rawAnswers, packageId } = input as { answers?: unknown; packageId?: unknown };
  if (!rawAnswers || typeof rawAnswers !== "object") return null;
  if (typeof packageId !== "string" || !(PACKAGE_IDS as readonly string[]).includes(packageId)) return null;
  const answers = pruneAnswers(rawAnswers as Record<string, unknown>);
  if (!isComplete(answers)) return null;
  return { answers, packageId: packageId as PackageId };
}

/** Saves (or refreshes) the offer and returns its code; null when the store is not configured. */
export async function saveSharedOffer(
  answers: Answers,
  packageId: PackageId,
  secret: string,
  {
    env = process.env,
    fetchImpl = fetch,
    now = Date.now(),
    ageMinutes = null,
  }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; now?: number; ageMinutes?: number | null } = {},
): Promise<string | null> {
  const kv = kvFromEnv(env, fetchImpl);
  if (!kv) return null;
  const quickPercent = quickPercentAt(ageMinutes);
  const content = canonical(answers, packageId, quickPercent);
  const value = JSON.stringify({ answers, packageId, createdAt: now, ageMinutes } satisfies SharedOffer);

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = offerCode(answers, packageId, secret, quickPercent, attempt);
    const key = `offer-share:${code}`;
    // NX: a code never overwrites a different offer.
    if ((await kvCommand(kv, ["SET", key, value, "NX", "EX", SHARE_TTL_SECONDS])) === "OK") return code;
    // Taken: by this very snapshot (refresh it – the latest moment wins, only the countdown moves within the tier)…
    if (await holdsSnapshot(kv, key, content)) {
      await kvCommand(kv, ["SET", key, value, "EX", SHARE_TTL_SECONDS]);
      return code;
    }
    // …or by another offer: try the next code.
  }
  throw new Error("offer-share: no free code");
}

async function holdsSnapshot(kv: Kv, key: string, content: string): Promise<boolean> {
  const raw = await kvCommand(kv, ["GET", key]);
  if (typeof raw !== "string") return false;
  const stored = parseStored(raw);
  return stored !== null && canonical(stored.answers, stored.packageId, quickPercentAt(stored.ageMinutes)) === content;
}

function parseStored(raw: string): SharedOffer | null {
  try {
    const parsed = JSON.parse(raw) as SharedOffer;
    const valid = parseShareInput(parsed);
    const age = typeof parsed.ageMinutes === "number" && Number.isFinite(parsed.ageMinutes) ? parsed.ageMinutes : null;
    return valid ? { ...valid, createdAt: Number(parsed.createdAt) || 0, ageMinutes: age } : null;
  } catch {
    return null;
  }
}

export async function loadSharedOffer(
  code: string,
  { env = process.env, fetchImpl = fetch }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch } = {},
): Promise<SharedOffer | null> {
  const kv = kvFromEnv(env, fetchImpl);
  const normalized = normalizeCode(code);
  if (!kv || !normalized) return null;
  const raw = await kvCommand(kv, ["GET", `offer-share:${normalized}`]);
  return typeof raw === "string" ? parseStored(raw) : null;
}
