import { describe, expect, it, vi } from "vitest";
import { kvCommand, kvFromEnv, kvPipeline } from "./kv";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("kv client", () => {
  it("is null without credentials and prefers the KV_* variables", () => {
    expect(kvFromEnv(env({}))).toBeNull();
    expect(kvFromEnv(env({ KV_REST_API_URL: "https://kv.example" }))).toBeNull();
    expect(kvFromEnv(env({ KV_REST_API_URL: "https://a.example/", KV_REST_API_TOKEN: "a", UPSTASH_REDIS_REST_URL: "https://b.example", UPSTASH_REDIS_REST_TOKEN: "b" }))).toMatchObject({ url: "https://a.example", token: "a" });
    expect(kvFromEnv(env({ UPSTASH_REDIS_REST_URL: "https://b.example", UPSTASH_REDIS_REST_TOKEN: "b" }))).toMatchObject({ url: "https://b.example", token: "b" });
  });

  it("sends one command as strings and returns its result", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ result: "OK" }));
    const kv = kvFromEnv(env({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" }), fetchImpl as unknown as typeof fetch)!;
    expect(await kvCommand(kv, ["SET", "k", "v", "EX", 60])).toBe("OK");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://kv.example");
    expect(JSON.parse(String(init.body))).toEqual(["SET", "k", "v", "EX", "60"]);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer t");
  });

  it("throws on HTTP errors and command errors", async () => {
    const kv = (response: Response) => kvFromEnv(env({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" }), (async () => response) as unknown as typeof fetch)!;
    await expect(kvCommand(kv(Response.json({ error: "WRONGPASS" }, { status: 401 })), ["GET", "k"])).rejects.toThrow("Upstash 401: WRONGPASS");
    await expect(kvCommand(kv(Response.json({ error: "ERR syntax" })), ["GET", "k"])).rejects.toThrow("ERR syntax");
    await expect(kvPipeline(kv(Response.json([{ result: 1 }, { error: "ERR wrong type" }])), [["INCR", "a"], ["INCR", "b"]])).rejects.toThrow("ERR wrong type");
    await expect(kvPipeline(kv(new Response("oops", { status: 500 })), [["INCR", "a"]])).rejects.toThrow("Upstash 500");
  });

  it("returns pipeline results in order", async () => {
    const fetchImpl = vi.fn(async () => Response.json([{ result: 3 }, { result: null }]));
    const kv = kvFromEnv(env({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" }), fetchImpl as unknown as typeof fetch)!;
    expect(await kvPipeline(kv, [["INCR", "a"], ["GET", "b"]])).toEqual([3, null]);
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe("https://kv.example/pipeline");
  });
});
