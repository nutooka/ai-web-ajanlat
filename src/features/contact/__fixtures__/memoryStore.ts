import type { FirstSeenStore } from "../contactLock";

/** In-memory twin of the Upstash store for flow tests. */
export function memoryStore(): FirstSeenStore {
  const data = new Map<string, number>();
  return async (keys, candidate) => {
    let repeat = false;
    let firstSeenAt = candidate;
    for (const key of keys) {
      if (data.has(key)) repeat = true;
      else data.set(key, candidate);
      firstSeenAt = Math.min(firstSeenAt, data.get(key)!);
    }
    return { firstSeenAt, repeat };
  };
}
