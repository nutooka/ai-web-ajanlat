import { describe, expect, it } from "vitest";
import { getVisibleQuestions } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { loadSharedOffer, normalizeCode, offerCode, parseShareInput, saveSharedOffer } from "./share";

/** A complete landing-page questionnaire: first option everywhere. */
function completeAnswers(): Answers {
  const answers: Record<string, string | string[]> = { projectType: "landing" };
  for (let round = 0; round < 40; round += 1) {
    for (const question of getVisibleQuestions(answers as Answers)) {
      if (answers[question.id] !== undefined) continue;
      answers[question.id] = question.kind === "text" ? "teszt" : question.kind === "multi" ? [question.options[0].id] : question.options[0].id;
    }
  }
  return answers as Answers;
}
const complete = completeAnswers();

/** Minimal in-memory Upstash REST fake (single commands). */
function fakeKv() {
  const data = new Map<string, string>();
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    const [command, key, value, ...rest] = JSON.parse(String(init?.body)) as string[];
    let result: unknown = null;
    if (command === "SET") {
      if (rest.includes("NX") && data.has(key)) result = null;
      else {
        data.set(key, value);
        result = "OK";
      }
    } else if (command === "GET") result = data.get(key) ?? null;
    else if (command === "EXPIRE") result = 1;
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as typeof fetch;
  return { data, fetchImpl, env: { KV_REST_API_URL: "https://kv.test", KV_REST_API_TOKEN: "t" } as unknown as NodeJS.ProcessEnv };
}

describe("offer code", () => {
  it("is short, readable and stable for the same answers + package", () => {
    const code = offerCode(complete, "standard", "s");
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(offerCode({ ...complete }, "standard", "s")).toBe(code);
    expect(offerCode(complete, "premium", "s")).not.toBe(code);
  });

  it("accepts typed variants of a code, old 6-character codes included", () => {
    expect(normalizeCode(" k7m-3qx ")).toBe("K7M3QX");
    expect(normalizeCode("k7m3-qx2a")).toBe("K7M3QX2A");
    expect(normalizeCode("K7M3Q0")).toBeNull();
    expect(normalizeCode("K7M3QX2")).toBeNull();
  });

  it("never overwrites another offer: on a collision it moves on to the next code", async () => {
    const kv = fakeKv();
    const taken = await saveSharedOffer(complete, "basic", "s", { env: fakeKv().env, fetchImpl: fakeKv().fetchImpl });
    const other = JSON.stringify({ answers: complete, packageId: "premium", createdAt: 1, ageMinutes: null });
    kv.data.set(`offer-share:${taken}`, other);
    const code = await saveSharedOffer(complete, "basic", "s", { env: kv.env, fetchImpl: kv.fetchImpl });
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(code).not.toBe(taken);
    expect(kv.data.get(`offer-share:${taken}`)).toBe(other);
    // Saving the same snapshot again finds its own code and refreshes it.
    expect(await saveSharedOffer(complete, "basic", "s", { env: kv.env, fetchImpl: kv.fetchImpl, now: 99 })).toBe(code);
    expect((await loadSharedOffer(code!, { env: kv.env, fetchImpl: kv.fetchImpl }))?.createdAt).toBe(99);
  });

  it("still opens links with old 6-character codes", async () => {
    const kv = fakeKv();
    kv.data.set("offer-share:K7M3QX", JSON.stringify({ answers: complete, packageId: "basic", createdAt: 5, ageMinutes: 3 }));
    expect(await loadSharedOffer("k7m3qx", { env: kv.env, fetchImpl: kv.fetchImpl })).toMatchObject({ packageId: "basic", ageMinutes: 3 });
  });

  it("only shares complete questionnaires with a known package", () => {
    if (!parseShareInput({ answers: complete, packageId: "standard" })) {
      // The fixture must be a complete questionnaire for the round-trip below.
      throw new Error("fixture incomplete");
    }
    expect(parseShareInput({ answers: { projectType: "landing" }, packageId: "standard" })).toBeNull();
    expect(parseShareInput({ answers: complete, packageId: "gold" })).toBeNull();
  });

  it("round-trips the exact moment: answers, package and offer age", async () => {
    const kv = fakeKv();
    const parsed = parseShareInput({ answers: complete, packageId: "basic" })!;
    const code = await saveSharedOffer(parsed.answers, "basic", "s", { env: kv.env, fetchImpl: kv.fetchImpl, now: 1000, ageMinutes: 12 });
    const loaded = await loadSharedOffer(code!.toLowerCase(), { env: kv.env, fetchImpl: kv.fetchImpl });
    expect(loaded).toMatchObject({ packageId: "basic", createdAt: 1000, ageMinutes: 12, answers: parsed.answers });
    expect(await loadSharedOffer("AAAAAA", { env: kv.env, fetchImpl: kv.fetchImpl })).toBeNull();
  });

  it("a different discount tier or deadline is a different code (a screenshot always matches its link)", async () => {
    const kv = fakeKv();
    const opts = (ageMinutes: number | null) => ({ env: kv.env, fetchImpl: kv.fetchImpl, ageMinutes });
    const firstHour = await saveSharedOffer(complete, "standard", "s", opts(5));
    const sameTier = await saveSharedOffer(complete, "standard", "s", opts(40));
    const expired = await saveSharedOffer(complete, "standard", "s", opts(49 * 60));
    expect(sameTier).toBe(firstHour);
    expect(expired).not.toBe(firstHour);
    const slider = await saveSharedOffer({ ...complete, deadlineWeeks: "9" }, "standard", "s", opts(5));
    expect(slider).not.toBe(firstHour);
    // Within a tier the latest moment wins (the countdown keeps moving, the prices do not).
    expect((await loadSharedOffer(firstHour!, { env: kv.env, fetchImpl: kv.fetchImpl }))?.ageMinutes).toBe(40);
  });

  it("old links without an age load as 'no quick-decision discount'", async () => {
    const kv = fakeKv();
    const code = offerCode(complete, "basic", "s");
    kv.data.set(`offer-share:${code}`, JSON.stringify({ answers: complete, packageId: "basic", createdAt: 5 }));
    expect((await loadSharedOffer(code, { env: kv.env, fetchImpl: kv.fetchImpl }))?.ageMinutes).toBeNull();
  });

  it("does nothing without a store", async () => {
    expect(await saveSharedOffer(complete, "basic", "s", { env: {} as unknown as NodeJS.ProcessEnv })).toBeNull();
  });
});
