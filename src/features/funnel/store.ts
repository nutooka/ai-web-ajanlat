import { isFunnelStep } from "./steps";

const TTL_SECONDS = 120 * 24 * 60 * 60;

/** One hash per day (Bucharest time): field = step, value = count. */
export function funnelKey(now: number): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(now);
  return `funnel:${day}`;
}

/** Counts one step. Silently does nothing when Upstash is not configured. */
export async function recordFunnelStep(
  step: unknown,
  { env = process.env, fetchImpl = fetch, now = Date.now() }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; now?: number } = {},
): Promise<boolean> {
  if (!isFunnelStep(step)) return false;
  const url = (env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL)?.replace(/\/$/, "");
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;

  const key = funnelKey(now);
  const response = await fetchImpl(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["HINCRBY", key, step, "1"],
      ["EXPIRE", key, String(TTL_SECONDS)],
    ]),
    cache: "no-store",
  });
  return response.ok;
}
