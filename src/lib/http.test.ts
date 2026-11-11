import { describe, expect, it } from "vitest";
import { clientIp, readJsonBody } from "./http";

describe("clientIp", () => {
  it("takes the first forwarded hop, then x-real-ip", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("readJsonBody", () => {
  const post = (body: string, headers: Record<string, string> = {}) => new Request("https://x.test/", { method: "POST", body, headers });

  it("parses JSON within the limit", async () => {
    expect(await readJsonBody(post('{"a":1}'), 100)).toEqual({ ok: true, value: { a: 1 } });
  });

  it("refuses oversized bodies by declared length and by actual bytes", async () => {
    expect(await readJsonBody(post("x".repeat(50), { "content-length": "5000" }), 100)).toEqual({ ok: false, status: 413 });
    // Multi-byte characters count as bytes, not characters.
    expect(await readJsonBody(post(JSON.stringify("é".repeat(60))), 100)).toEqual({ ok: false, status: 413 });
  });

  it("rejects invalid JSON and missing bodies", async () => {
    expect(await readJsonBody(post("{nope"), 100)).toEqual({ ok: false, status: 400 });
    expect(await readJsonBody(new Request("https://x.test/", { method: "POST" }), 100)).toEqual({ ok: false, status: 400 });
  });
});
