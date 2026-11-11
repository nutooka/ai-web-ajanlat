import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const KEY = "nutooka-offer:v1";

function installWindow(storage: Partial<Storage>) {
  vi.stubGlobal("window", { localStorage: storage, addEventListener: () => {}, removeEventListener: () => {} });
}

describe("wizard storage", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the new value in memory when localStorage refuses to write (private mode)", async () => {
    const old = JSON.stringify({ answers: { projectType: "landing" }, currentId: null, packageId: "basic", submission: null, updatedAt: 1 });
    installWindow({
      getItem: () => old,
      setItem: () => {
        throw new DOMException("QuotaExceededError");
      },
      removeItem: () => {
        throw new DOMException("QuotaExceededError");
      },
    });
    const { getSnapshot, wizardStore } = await import("./storage");
    expect(getSnapshot().packageId).toBe("basic");

    wizardStore.update({ packageId: "premium", answers: { projectType: "webshop" } });
    expect(getSnapshot().packageId).toBe("premium");
    expect(getSnapshot().answers).toEqual({ projectType: "webshop" });

    wizardStore.reset();
    expect(getSnapshot().answers).toEqual({});
  });

  it("reads through to localStorage while it works", async () => {
    const data = new Map<string, string>();
    installWindow({ getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value), removeItem: (key: string) => void data.delete(key) });
    const { getSnapshot, wizardStore } = await import("./storage");
    wizardStore.update({ packageId: "premium" });
    expect(JSON.parse(data.get(KEY)!).packageId).toBe("premium");
    // Another tab changed it: the snapshot follows.
    data.set(KEY, JSON.stringify({ answers: {}, packageId: "basic" }));
    expect(getSnapshot().packageId).toBe("basic");
  });
});
