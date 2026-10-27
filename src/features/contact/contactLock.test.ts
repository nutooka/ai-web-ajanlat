import { describe, expect, it, vi } from "vitest";
import { contactKeys, createUpstashFirstSeenStore, normalizePhone } from "./contactLock";

const secret = "test-secret-0123456789";

describe("contact keys", () => {
  it("treats the same phone number written differently as one contact", () => {
    for (const variant of ["+40 712 345 678", "0040712345678", "0712-345-678", "712 345 678"]) {
      expect(normalizePhone(variant)).toBe("712345678");
    }
    expect(contactKeys({ phone: "+40 712 345 678" }, secret)).toEqual(contactKeys({ phone: "0712 345 678" }, secret));
  });

  it("is case-insensitive for e-mails and never contains the raw contact", () => {
    const [key] = contactKeys({ email: "Anna@Example.com" }, secret);
    expect(contactKeys({ email: "anna@example.com " }, secret)).toEqual([key]);
    expect(key).not.toContain("anna");
    expect(key).toMatch(/^offer-first-seen:[0-9a-f]{64}$/);
  });

  it("depends on the secret", () => {
    expect(contactKeys({ phone: "0712345678" }, secret)).not.toEqual(contactKeys({ phone: "0712345678" }, "another-secret-987654"));
  });
});

describe("Upstash store", () => {
  it("is disabled without credentials", () => {
    expect(createUpstashFirstSeenStore({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it("sends SET NX EX + GET and returns the earliest value", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ result: null }, { result: "1000" }, { result: "OK" }, { result: "5000" }])));
    const store = createUpstashFirstSeenStore({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" } as unknown as NodeJS.ProcessEnv, fetchMock as unknown as typeof fetch)!;
    const result = await store(["a", "b"], 5000);
    expect(result).toEqual({ firstSeenAt: 1000, repeat: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://kv.example/pipeline");
    expect(JSON.parse(String(init.body))[0]).toEqual(["SET", "a", "5000", "NX", "EX", String(30 * 24 * 60 * 60)]);
  });
});
