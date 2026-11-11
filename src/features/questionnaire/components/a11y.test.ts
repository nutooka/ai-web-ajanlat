import { describe, expect, it } from "vitest";
import { nextRadioIndex, rovingTabIndex } from "./a11y";

describe("nextRadioIndex", () => {
  it("moves forward with Down/Right and wraps", () => {
    expect(nextRadioIndex("ArrowDown", 0, 3)).toBe(1);
    expect(nextRadioIndex("ArrowRight", 2, 3)).toBe(0);
  });

  it("moves back with Up/Left and wraps", () => {
    expect(nextRadioIndex("ArrowUp", 1, 3)).toBe(0);
    expect(nextRadioIndex("ArrowLeft", 0, 3)).toBe(2);
  });

  it("jumps to the ends with Home/End", () => {
    expect(nextRadioIndex("Home", 2, 4)).toBe(0);
    expect(nextRadioIndex("End", 0, 4)).toBe(3);
  });

  it("ignores other keys and empty groups", () => {
    expect(nextRadioIndex("Enter", 0, 3)).toBeNull();
    expect(nextRadioIndex(" ", 0, 3)).toBeNull();
    expect(nextRadioIndex("ArrowDown", 0, 0)).toBeNull();
  });
});

describe("rovingTabIndex", () => {
  it("makes the checked radio the only Tab stop", () => {
    expect([0, 1, 2].map((index) => rovingTabIndex(index, 1))).toEqual([-1, 0, -1]);
  });

  it("falls back to the first radio when none is checked", () => {
    expect([0, 1, 2].map((index) => rovingTabIndex(index, -1))).toEqual([0, -1, -1]);
  });
});
