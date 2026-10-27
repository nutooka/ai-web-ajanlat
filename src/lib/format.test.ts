import { describe, expect, it } from "vitest";
import { formatRon, formatWeeks } from "./format";

describe("format", () => {
  it("groups thousands consistently", () => {
    expect(formatRon(9550)).toBe("9 550 RON");
    expect(formatRon(10950)).toBe("10 950 RON");
  });

  it("formats week ranges", () => {
    expect(formatWeeks(4, 6)).toBe("4–6 hét");
    expect(formatWeeks(2, 2)).toBe("2 hét");
  });
});
