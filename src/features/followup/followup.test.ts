import { describe, expect, it, vi } from "vitest";
import { auditFollowUps, MAX_AHEAD, offerFollowUps, STOP_URL_PLACEHOLDER } from "./plan";
import { scheduleSequence, stopSequence, stopToken, verifyStopToken, type FollowUpDeps, type ScheduledEmail, type SequenceStore } from "./sequence";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 10, 10, 9, 0);
const SECRET = "test-secret-0123456789";

function memorySequenceStore(): SequenceStore & { data: Map<string, string[]> } {
  const data = new Map<string, string[]>();
  return {
    data,
    save: async (id, ids) => {
      data.set(id, ids);
    },
    take: async (id) => {
      const ids = data.get(id) ?? null;
      data.delete(id);
      return ids;
    },
  };
}

function fakeDeps(overrides: Partial<FollowUpDeps> = {}) {
  const scheduled: ScheduledEmail[] = [];
  const cancelled: string[] = [];
  const store = memorySequenceStore();
  const deps: FollowUpDeps = {
    schedule: async (email) => {
      scheduled.push(email);
      return `email-${scheduled.length}`;
    },
    cancel: async (id) => {
      cancelled.push(id);
    },
    store,
    secret: SECRET,
    ...overrides,
  };
  return { deps, scheduled, cancelled, store };
}

const base = { now: NOW, discountPercent: 25, packageName: "Standard", shareUrl: "https://nutooka.tech/a/K7M3QX", firstName: "Anna" };

describe("offerFollowUps", () => {
  it("consultation request: day 3 and day 7, no discount reminder", () => {
    const plan = offerFollowUps({ ...base, discountEndsAt: null });
    expect(plan.map((item) => item.id)).toEqual(["offer.questions", "offer.checkin"]);
    expect(plan.map((item) => item.sendAt - NOW)).toEqual([3 * DAY, 7 * DAY]);
    expect(plan[0].email.text).toContain("Szia Anna!");
    expect(plan[0].email.html).toContain(STOP_URL_PLACEHOLDER);
  });

  it("saved offer: reminds 12 hours before the discount ends", () => {
    const plan = offerFollowUps({ ...base, discountEndsAt: NOW + 47 * HOUR });
    expect(plan[0].id).toBe("offer.reminder");
    expect(plan[0].sendAt).toBe(NOW + 35 * HOUR);
    expect(plan[0].email.subject).toContain("−25%");
  });

  it("skips the reminder when the discount ends too soon", () => {
    const plan = offerFollowUps({ ...base, discountEndsAt: NOW + 13 * HOUR });
    expect(plan.map((item) => item.id)).not.toContain("offer.reminder");
  });

  it("escapes visitor-provided text in HTML", () => {
    const plan = offerFollowUps({ ...base, discountEndsAt: null, firstName: "<b>x</b>" });
    expect(plan[0].email.html).not.toContain("<b>x</b>");
  });
});

describe("auditFollowUps", () => {
  it("day 2 and day 28, within the provider's scheduling window", () => {
    const plan = auditFollowUps({ now: NOW, url: "https://pelda.ro/" });
    expect(plan.map((item) => item.sendAt - NOW)).toEqual([2 * DAY, 28 * DAY]);
    expect(plan.every((item) => item.sendAt - NOW <= MAX_AHEAD)).toBe(true);
    expect(plan[0].email.subject).toContain("pelda.ro");
  });
});

describe("stop tokens", () => {
  it("accepts its own token and rejects tampered ones", () => {
    const token = stopToken("abcdefghijklmnopqrstuv", SECRET);
    expect(verifyStopToken(token, SECRET)).toBe("abcdefghijklmnopqrstuv");
    expect(verifyStopToken(token, "another-secret-0123456")).toBeNull();
    expect(verifyStopToken(`${token}x`, SECRET)).toBeNull();
    expect(verifyStopToken("nonsense", SECRET)).toBeNull();
  });

  it("still accepts links signed with the raw secret before the per-purpose keys", async () => {
    const { createHmac } = await import("node:crypto");
    const id = "abcdefghijklmnopqrstuv";
    const legacy = `${id}.${createHmac("sha256", SECRET).update(`followup:${id}`).digest("base64url").slice(0, 22)}`;
    expect(legacy).not.toBe(stopToken(id, SECRET));
    expect(verifyStopToken(legacy, SECRET)).toBe(id);
    expect(verifyStopToken(legacy, "another-secret-0123456")).toBeNull();
  });
});

describe("scheduleSequence / stopSequence", () => {
  it("schedules every e-mail with a personal stop link, then stops them all", async () => {
    const { deps, scheduled, cancelled } = fakeDeps();
    const result = await scheduleSequence(auditFollowUps({ now: NOW, url: "https://pelda.ro/" }), { to: "a@example.com" }, deps);
    expect(result?.ids).toEqual(["email-1", "email-2"]);
    expect(scheduled[0].html).not.toContain(STOP_URL_PLACEHOLDER);
    expect(scheduled[0].text).toContain(result!.stopUrl);
    expect(scheduled[0].headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");

    const token = new URL(result!.stopUrl).searchParams.get("t");
    expect(await stopSequence(token, deps)).toBe("stopped");
    expect(cancelled).toEqual(["email-1", "email-2"]);
    expect(await stopSequence(token, deps)).toBe("unknown");
    expect(await stopSequence("forged.token", deps)).toBe("invalid");
  });

  it("cancels what it scheduled when the store fails, so nothing unstoppable goes out", async () => {
    const failing: SequenceStore = { save: async () => Promise.reject(new Error("down")), take: async () => null };
    const { deps, cancelled } = fakeDeps({ store: failing });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await scheduleSequence(auditFollowUps({ now: NOW, url: "https://pelda.ro/" }), { to: "a@example.com" }, deps);
    expect(result).toBeNull();
    expect(cancelled).toEqual(["email-1", "email-2"]);
  });
});
