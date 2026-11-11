import { kvFromEnv, kvPipeline } from "@/lib/kv";
import { isFunnelStep } from "./steps";

const TTL_SECONDS = 120 * 24 * 60 * 60;

/** One hash per day (Bucharest time): field = step, value = count. */
export function funnelKey(now: number): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(now);
  return `funnel:${day}`;
}

/** Counts one step. Silently does nothing when Upstash is not configured; throws when the store fails. */
export async function recordFunnelStep(
  step: unknown,
  { env = process.env, fetchImpl = fetch, now = Date.now() }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; now?: number } = {},
): Promise<boolean> {
  if (!isFunnelStep(step)) return false;
  const kv = kvFromEnv(env, fetchImpl);
  if (!kv) return false;

  const key = funnelKey(now);
  await kvPipeline(kv, [
    ["HINCRBY", key, step, 1],
    ["EXPIRE", key, TTL_SECONDS],
  ]);
  return true;
}
