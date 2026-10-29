import { describe, expect, it, vi } from "vitest";
import { isFunnelStep } from "./steps";
import { funnelKey, recordFunnelStep } from "./store";

const env = { KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" } as unknown as NodeJS.ProcessEnv;

describe("funnel counter", () => {
  it("accepts only question views and known events", () => {
    expect(isFunnelStep("q:shop_courier")).toBe(true);
    expect(isFunnelStep("offer_view")).toBe(true);
    expect(isFunnelStep("q:<script>")).toBe(false);
    expect(isFunnelStep("anything")).toBe(false);
    expect(isFunnelStep(42)).toBe(false);
  });

  it("increments the day's hash and sets an expiry", async () => {
    const fetchImpl = vi.fn(async () => new Response("[]", { status: 200 }));
    const now = Date.UTC(2026, 9, 29, 22, 30); // 22:30 UTC = 00:30 next day in Bucharest (UTC+2)
    expect(await recordFunnelStep("q:domain", { env, fetchImpl, now })).toBe(true);
    expect(funnelKey(now)).toBe("funnel:2026-10-30");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://kv.example/pipeline");
    expect(JSON.parse(String(init.body))).toEqual([
      ["HINCRBY", "funnel:2026-10-30", "q:domain", "1"],
      ["EXPIRE", "funnel:2026-10-30", String(120 * 24 * 60 * 60)],
    ]);
  });

  it("does nothing for unknown steps or without Upstash", async () => {
    const fetchImpl = vi.fn();
    expect(await recordFunnelStep("bad", { env, fetchImpl })).toBe(false);
    expect(await recordFunnelStep("offer_view", { env: {} as NodeJS.ProcessEnv, fetchImpl })).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
