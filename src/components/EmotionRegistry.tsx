"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
// Internal Next.js context: its value (the "add callback" function) is unique per request.
import { ServerInsertedHTMLContext } from "next/dist/shared/lib/server-inserted-html.shared-runtime";
import { Fragment, useContext, useState } from "react";

/**
 * Style names already written into the HTML, per request.
 * With Cache Components a suspended subtree can make React re-render the layout with fresh state,
 * which creates a second Emotion cache whose styles were emitted a second time (≈130 KB duplicate CSS).
 * Keying by the per-request context value lets every registry of the same request skip what is already out.
 */
const emittedPerRequest = new WeakMap<object, Set<string>>();

/** Emotion + MUI style registry for the App Router (replaces @mui/material-nextjs AppRouterCacheProvider). */
export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const requestKey = useContext(ServerInsertedHTMLContext) as object | null;

  const [registry] = useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: { name: string; isGlobal: boolean }[] = [];
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) inserted.push({ name: serialized.name, isGlobal: !selector });
      return prevInsert(...args);
    };
    const flush = () => {
      const previous = inserted;
      inserted = [];
      return previous;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    let emitted = requestKey ? emittedPerRequest.get(requestKey) : undefined;
    if (requestKey && !emitted) {
      emitted = new Set();
      emittedPerRequest.set(requestKey, emitted);
    }
    const fresh = registry.flush().filter(({ name }) => !emitted?.has(name));
    if (fresh.length === 0) return null;

    let styles = "";
    let dataEmotion = registry.cache.key;
    const globals: { name: string; style: string }[] = [];
    for (const { name, isGlobal } of fresh) {
      const style = registry.cache.inserted[name];
      if (typeof style !== "string") continue;
      emitted?.add(name);
      if (isGlobal) globals.push({ name, style });
      else {
        styles += style;
        dataEmotion += ` ${name}`;
      }
    }
    return (
      <Fragment>
        {globals.map(({ name, style }) => (
          <style key={name} data-emotion={`${registry.cache.key}-global ${name}`} dangerouslySetInnerHTML={{ __html: style }} />
        ))}
        {styles && <style data-emotion={dataEmotion} dangerouslySetInnerHTML={{ __html: styles }} />}
      </Fragment>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
