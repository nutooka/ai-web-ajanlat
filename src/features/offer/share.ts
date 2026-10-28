import { createHmac } from "node:crypto";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import { PACKAGE_IDS, type PackageId } from "@/features/pricing/types";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";

/**
 * Offer code: a short id for exactly what the visitor saw – answers (incl. the deadline slider),
 * package and the quick-decision discount tier at that moment. Any change gives a new code,
 * so a screenshot's code always opens the same prices. Kept for 180 days, without contact data.
 */
export const SHARE_TTL_SECONDS = 180 * 24 * 60 * 60;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
export const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

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

export function offerCode(answers: Answers, packageId: PackageId, secret: string, quickPercent = 0): string {
  const digest = createHmac("sha256", secret).update(canonical(answers, packageId, quickPercent)).digest();
  return Array.from(digest.subarray(0, 6), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
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

interface Kv {
  url: string;
  token: string;
}

function kvFromEnv(env: NodeJS.ProcessEnv): Kv | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function kvCommand(kv: Kv, command: string[], fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(kv.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${kv.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash ${response.status}`);
  return ((await response.json()) as { result?: unknown }).result;
}

export function shareStoreConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return kvFromEnv(env) !== null;
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
  const kv = kvFromEnv(env);
  if (!kv) return null;
  const code = offerCode(answers, packageId, secret, quickPercentAt(ageMinutes));
  // The latest moment wins (same code = same prices; only the countdown moves within the tier).
  const value: SharedOffer = { answers, packageId, createdAt: now, ageMinutes };
  await kvCommand(kv, ["SET", `offer-share:${code}`, JSON.stringify(value), "EX", String(SHARE_TTL_SECONDS)], fetchImpl);
  return code;
}

export async function loadSharedOffer(
  code: string,
  { env = process.env, fetchImpl = fetch }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch } = {},
): Promise<SharedOffer | null> {
  const kv = kvFromEnv(env);
  const normalized = normalizeCode(code);
  if (!kv || !normalized) return null;
  const raw = await kvCommand(kv, ["GET", `offer-share:${normalized}`], fetchImpl);
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as SharedOffer;
    const valid = parseShareInput(parsed);
    const age = typeof parsed.ageMinutes === "number" && Number.isFinite(parsed.ageMinutes) ? parsed.ageMinutes : null;
    return valid ? { ...valid, createdAt: Number(parsed.createdAt) || 0, ageMinutes: age } : null;
  } catch {
    return null;
  }
}
