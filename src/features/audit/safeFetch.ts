import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import { pipeline, Readable } from "node:stream";
import zlib from "node:zlib";

/**
 * Fetches a visitor-supplied public web page without letting it reach internal addresses (SSRF guard):
 * every hop (including redirects) is resolved and refused if it points to a private, loopback or link-local IP,
 * and the connection goes to exactly the address that was checked (no second DNS lookup → no DNS rebinding).
 * Small, time-boxed, size-capped – it only needs the HTML.
 */

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;

function isPrivateV4(octets: ArrayLike<number>): boolean {
  const [a, b, c] = [octets[0], octets[1], octets[2]];
  return (
    a === 0 || // "this network"
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) || // IETF protocol assignments, TEST-NET-1
    (a === 192 && b === 88 && c === 99) || // 6to4 relay anycast
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51 && c === 100) || // TEST-NET-2
    (a === 203 && b === 0 && c === 113) || // TEST-NET-3
    a >= 224 // multicast, reserved, broadcast
  );
}

/** IPv6 text (any valid form, incl. an embedded dotted IPv4 tail and a zone id) → 16 bytes; null when not IPv6. */
export function parseIPv6(input: string): Uint8Array | null {
  const address = input.replace(/^\[|\]$/g, "").split("%")[0];
  if (isIP(address) !== 6) return null;

  let text = address.toLowerCase();
  // An embedded dotted IPv4 tail ("::ffff:1.2.3.4") becomes the two hex groups it stands for.
  const dotted = text.match(/^(.*:)(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (dotted) {
    const [a, b, c, d] = dotted.slice(2).map(Number);
    text = `${dotted[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const groups = halves.length === 2 ? [...head, ...Array<string>(8 - head.length - tail.length).fill("0"), ...tail] : head;
  if (groups.length !== 8) return null;

  const bytes = new Uint8Array(16);
  groups.forEach((group, index) => {
    const value = parseInt(group, 16);
    bytes[index * 2] = value >> 8;
    bytes[index * 2 + 1] = value & 0xff;
  });
  return bytes;
}

const zeros = (bytes: Uint8Array, from: number, to: number) => bytes.subarray(from, to).every((byte) => byte === 0);

function isPrivateV6(bytes: Uint8Array): boolean {
  // ::/96 – the unspecified address, loopback and the deprecated IPv4-compatible form (checked as IPv4 below: 0.x is private).
  if (zeros(bytes, 0, 12)) return zeros(bytes, 12, 15) || isPrivateV4(bytes.subarray(12));
  // ::ffff:0:0/96 IPv4-mapped (also the hex form ::ffff:7f00:1) and ::ffff:0:0:0/96 IPv4-translated.
  if (zeros(bytes, 0, 10) && bytes[10] === 0xff && bytes[11] === 0xff) return isPrivateV4(bytes.subarray(12));
  if (zeros(bytes, 0, 8) && bytes[8] === 0xff && bytes[9] === 0xff && zeros(bytes, 10, 12)) return isPrivateV4(bytes.subarray(12));
  // 64:ff9b::/96 NAT64 – the embedded IPv4 decides; 64:ff9b:1::/48 local-use NAT64 is private.
  if (bytes[0] === 0x00 && bytes[1] === 0x64 && bytes[2] === 0xff && bytes[3] === 0x9b) {
    return zeros(bytes, 4, 12) ? isPrivateV4(bytes.subarray(12)) : true;
  }
  // 2002::/16 6to4 – IPv4 in bytes 2–5.
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return isPrivateV4(bytes.subarray(2, 6));
  // 2001::/32 Teredo (embeds an obfuscated client IPv4) and 2001:db8::/32 documentation.
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && ((bytes[2] === 0 && bytes[3] === 0) || (bytes[2] === 0x0d && bytes[3] === 0xb8))) return true;
  // 100::/64 discard-only.
  if (bytes[0] === 0x01 && bytes[1] === 0x00 && zeros(bytes, 2, 8)) return true;
  if ((bytes[0] & 0xfe) === 0xfc) return true; // fc00::/7 unique local
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return true; // fe80::/10 link-local
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0xc0) return true; // fec0::/10 site-local (deprecated)
  if (bytes[0] === 0xff) return true; // ff00::/8 multicast
  return false;
}

/** True for anything that is not a plain public unicast address (unparseable input counts as private). */
export function isPrivateAddress(address: string): boolean {
  const bare = address.replace(/^\[|\]$/g, "");
  if (isIP(bare) === 4) return isPrivateV4(bare.split(".").map(Number));
  const v6 = parseIPv6(bare);
  return v6 ? isPrivateV6(v6) : true;
}

interface Target {
  address: string;
  family: 4 | 6;
}

/** Checks the URL and returns the validated address to connect to. */
async function assertPublic(url: URL, resolve: typeof lookup): Promise<Target> {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("blocked: protocol");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("blocked: port");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const literal = isIP(host);
  const addresses = literal ? [{ address: host, family: literal }] : await resolve(host, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("blocked: private address");
  const [first] = addresses;
  return { address: first.address, family: first.family === 6 ? 6 : 4 };
}

/** A `lookup` that ignores the name and always answers with the already validated address. */
export function pinnedLookup(target: Target): LookupFunction {
  return (_hostname, options, callback) => {
    if (options.all) callback(null, [{ address: target.address, family: target.family }]);
    else callback(null, target.address, target.family);
  };
}

const NULL_BODY = new Set([101, 103, 204, 205, 304]);

/** Decompresses the body; `pipeline` passes a socket error or timeout on, so the reader never hangs. */
function decoded(stream: http.IncomingMessage): Readable {
  const encoding = String(stream.headers["content-encoding"] ?? "").trim().toLowerCase();
  const decoder =
    encoding === "gzip" || encoding === "x-gzip"
      ? zlib.createGunzip()
      : encoding === "deflate"
        ? zlib.createInflate()
        : encoding === "br"
          ? zlib.createBrotliDecompress()
          : null;
  return decoder ? pipeline(stream, decoder, () => undefined) : stream;
}

/**
 * One GET to `url`, connecting to `target` (Host header and TLS SNI stay the URL's name; certificates are verified
 * against it). No redirects, no connection reuse.
 */
export function requestPinned(url: URL, target: Target, { signal, headers }: { signal: AbortSignal; headers: Record<string, string> }): Promise<Response> {
  const client = url.protocol === "https:" ? https : http;
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  return new Promise((resolvePromise, reject) => {
    const request = client.request(
      {
        protocol: url.protocol,
        hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { ...headers, "Accept-Encoding": "gzip, deflate, br" },
        agent: false,
        signal,
        ...(isIP(hostname) ? {} : { lookup: pinnedLookup(target) }),
      },
      (incoming) => {
        const status = incoming.statusCode ?? 0;
        const responseHeaders = new Headers();
        for (const [name, value] of Object.entries(incoming.headers)) {
          if (value === undefined) continue;
          for (const item of Array.isArray(value) ? value : [value]) responseHeaders.append(name, item);
        }
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        if (status < 200 || status > 599 || NULL_BODY.has(status)) {
          incoming.resume();
          resolvePromise(new Response(null, { status: status >= 200 && status <= 599 ? status : 502, headers: responseHeaders }));
          return;
        }
        const body = Readable.toWeb(decoded(incoming)) as unknown as ReadableStream<Uint8Array>;
        resolvePromise(new Response(body, { status, headers: responseHeaders }));
      },
    );
    request.on("error", reject);
    request.end();
  });
}

interface FetchedPage {
  finalUrl: string;
  status: number;
  html: string;
  /** Number of redirects followed. */
  redirects: number;
}

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; NutookaCheck/1.0; +https://nutooka.tech/atvilagitas)", Accept: "text/html,*/*" };

/**
 * `fetchImpl` is for tests: an injected fetch resolves names itself, so only the default transport pins the address.
 */
export async function safeFetch(
  input: string,
  { fetchImpl, resolve = lookup, timeoutMs = 10_000, maxBytes = MAX_BYTES }: { fetchImpl?: typeof fetch; resolve?: typeof lookup; timeoutMs?: number; maxBytes?: number } = {},
): Promise<FetchedPage> {
  const signal = AbortSignal.timeout(timeoutMs);
  let url = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const target = await assertPublic(url, resolve);
    const response = fetchImpl
      ? await fetchImpl(url, { redirect: "manual", signal, headers: HEADERS })
      : await requestPinned(url, target, { signal, headers: HEADERS });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel().catch(() => undefined);
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
