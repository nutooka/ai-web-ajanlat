import { describe, expect, it, vi } from "vitest";
import type { Answers } from "@/features/questionnaire/types";
import { escapeHtml } from "./email/templates";
import { memoryStore } from "./__fixtures__/memoryStore";
import { submitOffer, type OutgoingEmail } from "./submitOffer";

const answers: Answers = {
  projectType: "landing",
  landing_goal: "leads",
  landing_sections: "3-5",
  landing_copy: "ready",
  landing_leadMagnet: "no",
  landing_analytics: "no",
  landing_ads: "no",
  languages: "1",
  domain: "has",
  branding: "full",
  design: "template",
  contentUpload: "self",
  deadline: "normal",
  budget: "10-20k",
  notes: "<b>hello</b>",
};

const submission = (overrides: Record<string, unknown> = {}) => ({
  answers,
  packageId: "standard",
  contact: { name: "Teszt Elek", email: "elek@example.com", wantsCopy: true, consent: true },
  website: "",
  elapsedMs: 8000,
  ...overrides,
});

function setup() {
  const sent: OutgoingEmail[] = [];
  const send = vi.fn(async (email: OutgoingEmail) => {
    sent.push(email);
  });
  return { sent, send, deps: { send, ownerEmail: "owner@example.com" } };
}

describe("submitOffer", () => {
  it("does not give the discount again to the same contact from a fresh browser", async () => {
    const store = memoryStore();
    const firstOpen = Date.UTC(2026, 9, 27, 9, 0);
    const lockDeps = { firstSeen: store, lockSecret: "test-secret-0123456789" };
    const contact = { phone: "+40 712 345 678", wantsCopy: false, consent: true };

    // Day 1: real first request, 10 minutes after opening → −25%.
    const first = setup();
    await submitOffer(submission({ contact }), { ...first.deps, ...lockDeps, offerOpenedAt: firstOpen, now: () => firstOpen + 10 * 60_000 });
    expect(first.sent[0].text).toContain("Gyors döntés kedvezmény: −25% (rögzítve)");
    expect(first.sent[0].text).toContain("Ismételt kérés?: Nem");

    // 3 hours later: new browser (fresh cookie), same number written differently → no discount, flagged.
    const later = firstOpen + 3 * 60 * 60_000;
    const second = setup();
    await submitOffer(submission({ contact: { ...contact, phone: "0712 345 678" } }), { ...second.deps, ...lockDeps, offerOpenedAt: later, now: () => later + 60_000 });
    expect(second.sent[0].text).toContain("Gyors döntés kedvezmény: nem járt");
    expect(second.sent[0].text).toContain("Ismételt kérés?: IGEN");
  });

  it("keeps working when the store fails", async () => {
    const { sent, deps } = setup();
    const result = await submitOffer(submission(), { ...deps, firstSeen: async () => Promise.reject(new Error("down")), lockSecret: "test-secret-0123456789" });
    expect(result.status).toBe(200);
    expect(sent[0].text).toContain("Nem sikerült ellenőrizni");
  });

  it("puts everything into the owner e-mail", async () => {
    const { sent, deps } = setup();
    const opened = Date.UTC(2026, 9, 27, 10, 0);
    await submitOffer(
      submission({
        answers: { ...answers, deadlineWeeks: "8" },
        contact: { name: "Teszt Elek", phone: "+40 712 345 678", company: "Elek Kft", message: "Hívjatok", callbackTime: "evening", wantsCopy: false, consent: true },
      }),
      { ...deps, offerOpenedAt: opened, offerAgeMinutes: 42, now: () => opened + 42 * 60_000 },
    );
    const text = sent[0].text;
    // Who and when to call – at the top and in the subject.
    expect(sent[0].subject).toContain("hívás: este");
    expect(text.split("\n").slice(0, 4).join(" ")).toContain("+40 712 345 678");
    expect(text).toContain("Mikor kérte: Este");
    // Timing.
    expect(text).toContain("Ennyi idő után kért egyeztetést: 42 perc");
    expect(text).toMatch(/Ajánlat első megnyitása: 2026\./);
    // Deadline slider.
    expect(text).toMatch(/Választott határidő: \d+ hét \(csúszkán\)/);
    // All packages, details, every answer, contact fields.
    for (const name of ["Basic", "Standard", "Premium"]) expect(text).toContain(name);
    for (const part of ["Keret:", "VÁLASZTOTT FUNKCIÓK", "MIT TARTALMAZ", "MIT NEM TARTALMAZ", "JAVASOLT TECHNOLÓGIA", "FENNTARTÁS", "Elek Kft", "Hívjatok", "<b>hello</b>"]) {
      expect(text).toContain(part);
    }
  });

  it("says when the offer clock was unknown", async () => {
    const { sent, deps } = setup();
    await submitOffer(submission(), { ...deps, offerOpenedAt: null });
    expect(sent[0].text).toContain("Ajánlat első megnyitása: ismeretlen");
  });

  it("locks in the quick-decision discount from the server clock", async () => {
    const early = setup();
    await submitOffer(submission(), { ...early.deps, offerAgeMinutes: 10 });
    const late = setup();
    await submitOffer(submission(), { ...late.deps, offerAgeMinutes: 200 });
    expect(early.sent[0].text).toMatch(/Gyors döntés kedvezmény: −25% \(rögzítve\)/);
    expect(late.sent[0].text).toMatch(/Gyors döntés kedvezmény: nem járt/);
  });

  it("sends the owner e-mail and the customer copy", async () => {
    const { sent, deps } = setup();
    const result = await submitOffer(submission(), deps);
    expect(result).toEqual({ status: 200, body: { ok: true, copySent: true } });
    expect(sent.map((email) => email.to)).toEqual(["owner@example.com", "elek@example.com"]);
    expect(sent[0].replyTo).toBe("elek@example.com");
    expect(sent[0].subject).toContain("Landing page");
  });

  it("shows hours to the owner only", async () => {
    const { sent, deps } = setup();
    await submitOffer(submission(), deps);
    const hours = /\d\s?óra/;
    expect(sent[0].text).toMatch(hours);
    expect(sent[1].text).not.toMatch(hours);
    expect(sent[1].html).not.toMatch(hours);
  });

  it("escapes user input in the HTML e-mail", async () => {
    const { sent, deps } = setup();
    await submitOffer(submission(), deps);
    expect(sent[0].html).not.toContain("<b>hello</b>");
    expect(sent[0].html).toContain(escapeHtml("<b>hello</b>"));
  });

  it("ignores a client-supplied price and re-prices on the server", async () => {
    const { sent, deps } = setup();
    await submitOffer(submission({ price: 1 }), deps);
    expect(sent[0].text).not.toMatch(/Becsült projektár \(nettó\): 1 RON/);
  });

  it("silently drops spam", async () => {
    const { send, deps } = setup();
    const honeypot = await submitOffer(submission({ website: "http://spam" }), deps);
    const tooFast = await submitOffer(submission({ elapsedMs: 100 }), deps);
    expect(honeypot.status).toBe(200);
    expect(tooFast.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid contact data", async () => {
    const { deps } = setup();
    const result = await submitOffer(submission({ contact: { email: "rossz", wantsCopy: false, consent: false } }), deps);
    expect(result.status).toBe(422);
    if (!result.body.ok) expect(Object.keys(result.body.fieldErrors ?? {})).toContain("contact.consent");
  });

  it("rejects incomplete questionnaires", async () => {
    const { deps } = setup();
    const result = await submitOffer(submission({ answers: { projectType: "landing" } }), deps);
    expect(result.status).toBe(400);
  });

  it("reports when e-mail is not configured", async () => {
    const result = await submitOffer(submission(), { send: null, ownerEmail: undefined });
    expect(result.status).toBe(503);
  });

  it("fails when the owner e-mail cannot be sent, but tolerates a failed copy", async () => {
    const failing = await submitOffer(submission(), { send: async () => Promise.reject(new Error("down")), ownerEmail: "o@example.com" });
    expect(failing.status).toBe(500);

    let calls = 0;
    const copyFails = await submitOffer(submission(), {
      send: async () => {
        calls += 1;
        if (calls === 2) throw new Error("copy down");
      },
      ownerEmail: "o@example.com",
    });
    expect(copyFails).toEqual({ status: 200, body: { ok: true, copySent: false } });
  });
});
