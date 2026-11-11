/**
 * Upstash Redis over its REST API (no SDK): one client for every feature that needs a small shared store.
 * `kvFromEnv` returns null when the store is not configured, so the app keeps working without it.
 * Every call checks the HTTP status and the per-command `error` field and throws on failure.
 */

export interface Kv {
  url: string;
  token: string;
  fetchImpl: typeof fetch;
}

type KvArg = string | number;

export function kvFromEnv(env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): Kv | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token, fetchImpl } : null;
}

interface KvReply {
  result?: unknown;
  error?: string;
}

async function post(kv: Kv, path: string, body: unknown): Promise<unknown> {
  const response = await kv.fetchImpl(`${kv.url}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kv.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = ((await response.json().catch(() => null)) as KvReply | null)?.error;
    throw new Error(`Upstash ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.json();
}

const stringify = (command: KvArg[]) => command.map(String);

/** Runs one command and returns its `result`. */
export async function kvCommand(kv: Kv, command: KvArg[]): Promise<unknown> {
  const reply = (await post(kv, "", stringify(command))) as KvReply | null;
  if (!reply || typeof reply !== "object") throw new Error("Upstash: unexpected reply");
  if (reply.error) throw new Error(`Upstash: ${reply.error}`);
  return reply.result ?? null;
}

/** Runs several commands in one round trip and returns their results in order. Throws if any command failed. */
export async function kvPipeline(kv: Kv, commands: KvArg[][]): Promise<unknown[]> {
  const replies = (await post(kv, "/pipeline", commands.map(stringify))) as KvReply[] | null;
  if (!Array.isArray(replies)) throw new Error("Upstash: unexpected pipeline reply");
  const failed = replies.find((reply) => reply?.error);
  if (failed) throw new Error(`Upstash: ${failed.error}`);
  return replies.map((reply) => reply?.result ?? null);
}
