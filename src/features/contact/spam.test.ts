import { describe, expect, it, vi } from "vitest";
import type { Kv } from "@/lib/kv";
import { createDurableRateLimiter, createRecipientGuard, recipientHash } from "./spam";

/** In-memory Upstash REST fake: INCR, EXPIRE (NX), SET (NX/EX), single commands and pipelines. */
function fakeKv() {
  const data = new Map<string, string>();
  const ttl = new Map<string, number>();
  const run = ([command, key, ...args]: string[]): unknown => {
    switch (command) {
      case "INCR": {
        const next = Number(data.get(key) ?? 0) + 1;
        data.set(key, String(next));
        return next;
      }
      case "EXPIRE":
        if (args.includes("NX") && ttl.has(key)) return 0;
        ttl.set(key, Number(args[0]));
        return 1;
      case "SET":
        if (args.includes("NX") && data.has(key)) return null;
        data.set(key, args[0]);
        return "OK";
      default:
        throw new Error(`unexpected ${command}`);
    }
  };
  const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as string[] | string[][];
    return url.endsWith("/pipeline") ? Response.json((body as string[][]).map((command) => ({ result: run(command) }))) : Response.json({ result: run(body as string[]) });
  });
  const kv: Kv = { url: "https://kv.test", token: "t", fetchImpl: fetchImpl as unknown as typeof fetch };
  return { kv, data, ttl, fetchImpl };
}

const failingKv: Kv = { url: "https://kv.test", token: "t", fetchImpl: (async () => new Response("down", { status: 503 })) as unknown as typeof fetch };

describe("durable rate limiter", () => {
  it("counts per window in the shared store with INCR + EXPIRE NX, without storing the raw id", async () => {
    const { kv, data, ttl, fetchImpl } = fakeKv();
    const isAllowed = createDurableRateLimiter({ scope: "offer", limit: 2, windowMs: 60_000, kv });
    expect(await isAllowed("203.0.113.7", 0)).toBe(true);
    expect(await isAllowed("203.0.113.7", 1000)).toBe(true);
    expect(await isAllowed("203.0.113.7", 2000)).toBe(false);
    expect(await isAllowed("203.0.113.8", 2000)).toBe(true);
    expect(await isAllowed("203.0.113.7", 60_000)).toBe(true); // next window
    const keys = [...data.keys()];
    expect(keys.every((key) => /^rl:offer:[\w-]+:\d+$/.test(key))).toBe(true);
    expect(keys.join()).not.toContain("203.0.113");
    expect([...ttl.values()]).toEqual([60, 60, 60]);
    expect(JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body))[1]).toEqual(expect.arrayContaining(["EXPIRE", "60", "NX"]));
  });

  it("is shared by every instance (two limiters, one store)", async () => {
    const { kv } = fakeKv();
    const a = createDurableRateLimiter({ scope: "q", limit: 1, windowMs: 60_000, kv });
    const b = createDurableRateLimiter({ scope: "q", limit: 1, windowMs: 60_000, kv });
    expect(await a("ip", 0)).toBe(true);
    expect(await b("ip", 0)).toBe(false);
  });

  it("falls back to the in-memory limit (logged) when the store fails or is missing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = createDurableRateLimiter({ scope: "q", limit: 1, windowMs: 60_000, kv: failingKv });
    expect(await failing("ip", 0)).toBe(true);
    expect(await failing("ip", 1)).toBe(false);
    expect(error).toHaveBeenCalled();
    const memory = createDurableRateLimiter({ scope: "q", limit: 1, windowMs: 60_000, kv: null });
    expect(await memory("ip", 0)).toBe(true);
    expect(await memory("ip", 1)).toBe(false);
    error.mockRestore();
  });
});

describe("recipient limit", () => {
  const secret = "test-secret-0123456789";

  it("hashes the lowercased address and never stores it", async () => {
    expect(recipientHash(" Anna@Example.com ", secret)).toBe(recipientHash("anna@example.com", secret));
    expect(recipientHash("anna@example.com", secret)).not.toBe(recipientHash("anna@example.com", "another-secret-0123456"));
    const { kv, data } = fakeKv();
    await createRecipientGuard({ secret, kv }).allowEmail("anna@example.com");
    expect([...data.keys()].join()).not.toContain("anna");
  });

  it("allows 2 e-mails per address per 24 hours, counted from the first", async () => {
    const { kv, ttl } = fakeKv();
    let now = Date.UTC(2026, 10, 11, 23, 0);
    const guard = createRecipientGuard({ secret, kv, now: () => now });
    expect(await guard.allowEmail("anna@example.com")).toBe(true);
    now += 2 * 60 * 60 * 1000; // past midnight: still the same 24-hour window
    expect(await guard.allowEmail("ANNA@example.com")).toBe(true);
    expect(await guard.allowEmail("anna@example.com")).toBe(false);
    expect(await guard.allowEmail("bela@example.com")).toBe(true);
    expect([...ttl.values()]).toContain(24 * 60 * 60);
  });

  it("starts at most one follow-up sequence per address per 30 days", async () => {
    const { kv, data } = fakeKv();
    const guard = createRecipientGuard({ secret, kv });
    expect(await guard.allowSequence("anna@example.com")).toBe(true);
    expect(await guard.allowSequence("Anna@Example.com")).toBe(false);
    expect(await guard.allowSequence("bela@example.com")).toBe(true);
    expect([...data.keys()].filter((key) => key.startsWith("rcpt-seq:"))).toHaveLength(2);
  });

  it("keeps a per-instance limit without a store and fails open (logged) when the store is down", async () => {
    const memory = createRecipientGuard({ secret, kv: null });
    expect(await memory.allowSequence("a@example.com")).toBe(true);
    expect(await memory.allowSequence("a@example.com")).toBe(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const down = createRecipientGuard({ secret, kv: failingKv });
    expect(await down.allowEmail("a@example.com")).toBe(true);
    expect(await down.allowSequence("a@example.com")).toBe(true);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
