import { describe, expect, it } from "vitest";
import { contactSchema, quickContactSchema, submissionSchema, toContact } from "./schema";
import { checkSpamSignals, createRateLimiter } from "./spam";

const valid = { name: "Teszt Elek", email: "teszt@example.com", wantsCopy: true, consent: true };

describe("contactSchema", () => {
  it("accepts a valid contact and drops empty strings", () => {
    const result = contactSchema.parse({ ...valid, phone: "", company: "  " });
    expect(result.phone).toBeUndefined();
    expect(result.company).toBeUndefined();
  });

  it("requires consent", () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("requires a way to reply", () => {
    const result = contactSchema.safeParse({ consent: true, wantsCopy: false });
    expect(result.success).toBe(false);
  });

  it("requires e-mail when a copy is requested", () => {
    const result = contactSchema.safeParse({ phone: "+40 712 345 678", wantsCopy: true, consent: true });
    expect(result.success).toBe(false);
    expect(contactSchema.safeParse({ phone: "+40 712 345 678", wantsCopy: false, consent: true }).success).toBe(true);
  });

  it("rejects malformed e-mail and phone", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nem-email" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, phone: "abc" }).success).toBe(false);
  });
});

describe("submissionSchema", () => {
  it("rejects an unknown package and oversized payloads", () => {
    const base = { answers: { projectType: "landing" }, packageId: "standard", contact: valid, elapsedMs: 5000 };
    expect(submissionSchema.safeParse(base).success).toBe(true);
    expect(submissionSchema.safeParse({ ...base, packageId: "gold" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...base, answers: { notes: "x".repeat(3000) } }).success).toBe(false);
  });
});

describe("spam protection", () => {
  it("flags the honeypot and too-fast submissions", () => {
    expect(checkSpamSignals({ website: "http://spam", elapsedMs: 10000 })).toEqual({ ok: false, reason: "honeypot" });
    expect(checkSpamSignals({ elapsedMs: 500 })).toEqual({ ok: false, reason: "too_fast" });
    expect(checkSpamSignals({ website: "", elapsedMs: 10000 })).toEqual({ ok: true });
  });

  it("rate limits per key within the window", () => {
    const isAllowed = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(isAllowed("ip", 0)).toBe(true);
    expect(isAllowed("ip", 10)).toBe(true);
    expect(isAllowed("ip", 20)).toBe(false);
    expect(isAllowed("other", 20)).toBe(true);
    expect(isAllowed("ip", 1500)).toBe(true);
  });
});

describe("quick contact form", () => {
  const base = { callbackTime: "asap" as const, name: "", company: "", message: "", wantsCopy: true, consent: true };

  it("accepts a phone number or an e-mail address in one field", () => {
    expect(quickContactSchema.safeParse({ ...base, reach: "+40 712 345 678" }).success).toBe(true);
    expect(quickContactSchema.safeParse({ ...base, reach: "anna@example.com" }).success).toBe(true);
    expect(quickContactSchema.safeParse({ ...base, reach: "holnap" }).success).toBe(false);
    expect(quickContactSchema.safeParse({ ...base, reach: "" }).success).toBe(false);
  });

  it("still requires consent", () => {
    expect(quickContactSchema.safeParse({ ...base, reach: "anna@example.com", consent: false }).success).toBe(false);
  });

  it("maps onto the shared schema the server validates", () => {
    const phone = toContact({ ...base, reach: " 0712 345 678 " });
    expect(phone).toMatchObject({ phone: "0712 345 678", email: undefined, wantsCopy: false, callbackTime: "asap" });
    expect(contactSchema.safeParse(phone).success).toBe(true);

    const email = toContact({ ...base, reach: "anna@example.com", callbackTime: "evening" });
    expect(email).toMatchObject({ email: "anna@example.com", phone: undefined, wantsCopy: true, callbackTime: "evening" });
    expect(contactSchema.safeParse(email).success).toBe(true);
  });

  it("rejects an unknown callback time on the server", () => {
    expect(contactSchema.safeParse({ ...valid, callbackTime: "midnight" }).success).toBe(false);
  });
});
