import { describe, expect, it } from "vitest";
import { purposeKey, serverSecret } from "./secrets";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("server secret", () => {
  it("uses the configured secret", () => {
    expect(serverSecret(env({ OFFER_CLOCK_SECRET: "0123456789abcdef", VERCEL_ENV: "production" }))).toBe("0123456789abcdef");
  });

  it("throws a clear error in production when it is missing or short", () => {
    expect(() => serverSecret(env({ VERCEL_ENV: "production" }))).toThrow(/OFFER_CLOCK_SECRET/);
    expect(() => serverSecret(env({ VERCEL_ENV: "production", OFFER_CLOCK_SECRET: "short" }))).toThrow(/OFFER_CLOCK_SECRET/);
  });

  it("falls back to a stable per-process value elsewhere", () => {
    const first = serverSecret(env({ VERCEL_ENV: "preview" }));
    expect(first.length).toBeGreaterThanOrEqual(32);
    expect(serverSecret(env({}))).toBe(first);
  });

  it("derives a different key per purpose and per secret", () => {
    const keys = (["clock", "contact", "share", "followup-stop"] as const).map((purpose) => purposeKey("secret-0123456789", purpose));
    expect(new Set(keys).size).toBe(4);
    expect(keys.every((key) => /^[0-9a-f]{64}$/.test(key))).toBe(true);
    expect(purposeKey("secret-0123456789", "clock")).toBe(keys[0]);
    expect(purposeKey("another-secret-0123", "clock")).not.toBe(keys[0]);
  });
});
