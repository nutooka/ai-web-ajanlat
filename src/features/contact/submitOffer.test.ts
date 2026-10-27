import { describe, expect, it, vi } from "vitest";
import type { Answers } from "@/features/questionnaire/types";
import { escapeHtml } from "./email/templates";
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
