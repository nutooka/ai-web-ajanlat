import { describe, expect, it } from "vitest";
import { offerAgeMinutes, readCookie, signOfferClock, verifyOfferClock } from "./offerClock";

const secret = "test-secret-0123456789";
const now = 1_800_000_000_000;

describe("offer clock", () => {
  it("round-trips a signed clock", () => {
    const value = signOfferClock(now - 30 * 60_000, secret);
    expect(verifyOfferClock(value, secret, now)).toBe(now - 30 * 60_000);
  });

  it("rejects tampering, a wrong secret and garbage", () => {
    const value = signOfferClock(now - 90 * 60_000, secret);
    const [, mac] = value.split(".");
    expect(verifyOfferClock(`${now}.${mac}`, secret, now)).toBeNull();
    expect(verifyOfferClock(value, "another-secret-0123456", now)).toBeNull();
    expect(verifyOfferClock("abc", secret, now)).toBeNull();
    expect(verifyOfferClock(undefined, secret, now)).toBeNull();
  });

  it("rejects clocks from the future or older than a week", () => {
    expect(verifyOfferClock(signOfferClock(now + 10 * 60_000, secret), secret, now)).toBeNull();
    expect(verifyOfferClock(signOfferClock(now - 8 * 24 * 3_600_000, secret), secret, now)).toBeNull();
  });

  it("computes age and treats a missing clock as brand new", () => {
    expect(offerAgeMinutes(now - 45 * 60_000, now)).toBe(45);
    expect(offerAgeMinutes(null, now)).toBe(0);
  });

  it("reads a cookie from the header", () => {
    expect(readCookie("a=1; nutooka_offer_clock=123.abc; b=2", "nutooka_offer_clock")).toBe("123.abc");
    expect(readCookie(null, "x")).toBeUndefined();
  });
});
