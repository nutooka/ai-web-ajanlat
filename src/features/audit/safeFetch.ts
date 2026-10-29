import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Fetches a visitor-supplied public web page without letting it reach internal addresses (SSRF guard):
 * every hop (including redirects) is resolved and refused if it points to a private, loopback or link-local IP.
 * Small, time-boxed, size-capped – it only needs the HTML.
 */

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;

export function isPrivateAddress(address: string): boolean {
  const v4 = address.startsWith("::ffff:") ? address.slice(7) : address;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = address.toLowerCase();
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb");
}

async function assertPublic(url: URL, resolve: typeof lookup): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("blocked: protocol");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("blocked: port");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [{ address: host }] : await resolve(host, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("blocked: private address");
}

export interface FetchedPage {
  finalUrl: string;
  status: number;
  html: string;
  /** Number of redirects followed. */
  redirects: number;
}

export async function safeFetch(
  input: string,
  { fetchImpl = fetch, resolve = lookup, timeoutMs = 10_000, maxBytes = MAX_BYTES }: { fetchImpl?: typeof fetch; resolve?: typeof lookup; timeoutMs?: number; maxBytes?: number } = {},
): Promise<FetchedPage> {
  const signal = AbortSignal.timeout(timeoutMs);
  let url = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublic(url, resolve);
    const response = await fetchImpl(url, {
      redirect: "manual",
      signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NutookaCheck/1.0; +https://nutooka.tech/atvilagitas)", Accept: "text/html,*/*" },
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    return { finalUrl: url.toString(), status: response.status, html: await readCapped(response, maxBytes), redirects: hop };
  }
  throw new Error("too many redirects");
}

async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder("utf-8", { fatal: false }).decode(concat(chunks).slice(0, maxBytes));
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
