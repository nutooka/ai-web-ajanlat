import { createHmac } from "node:crypto";
import { PACKAGE_IDS, type PackageId } from "@/features/pricing/types";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";

/**
 * Offer code: a short, stable id for one set of answers + package (same answers → same code).
 * The answers (no contact data) are kept for 180 days so a screenshot or a link always
 * leads back to the full offer.
 */
export const SHARE_TTL_SECONDS = 180 * 24 * 60 * 60;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
export const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

export interface SharedOffer {
  answers: Answers;
  packageId: PackageId;
  createdAt: number;
}

function canonical(answers: Answers, packageId: PackageId): string {
  const sorted = Object.fromEntries(Object.entries(answers).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ a: sorted, p: packageId });
}

export function offerCode(answers: Answers, packageId: PackageId, secret: string): string {
  const digest = createHmac("sha256", secret).update(canonical(answers, packageId)).digest();
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
  { env = process.env, fetchImpl = fetch, now = Date.now() }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; now?: number } = {},
): Promise<string | null> {
  const kv = kvFromEnv(env);
  if (!kv) return null;
  const code = offerCode(answers, packageId, secret);
  const value: SharedOffer = { answers, packageId, createdAt: now };
  // NX keeps the first createdAt; EX is refreshed below so an offer in use does not expire.
  await kvCommand(kv, ["SET", `offer-share:${code}`, JSON.stringify(value), "NX", "EX", String(SHARE_TTL_SECONDS)], fetchImpl);
  await kvCommand(kv, ["EXPIRE", `offer-share:${code}`, String(SHARE_TTL_SECONDS)], fetchImpl);
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
    return valid ? { ...valid, createdAt: Number(parsed.createdAt) || 0 } : null;
  } catch {
    return null;
  }
}
