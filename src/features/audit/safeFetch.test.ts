import { createServer, type IncomingHttpHeaders } from "node:http";
import { gzipSync } from "node:zlib";
import type { AddressInfo } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { isPrivateAddress, parseIPv6, pinnedLookup, requestPinned, safeFetch } from "./safeFetch";

describe("isPrivateAddress", () => {
  it("blocks private, loopback, link-local and reserved IPv4", () => {
    for (const address of ["0.0.0.0", "10.1.2.3", "127.0.0.1", "100.64.0.1", "169.254.169.254", "172.16.0.1", "172.31.255.255", "192.168.1.1", "192.0.0.8", "198.18.0.1", "224.0.0.1", "255.255.255.255"]) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
    for (const address of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "100.128.0.1", "93.184.216.34"]) {
      expect(isPrivateAddress(address), address).toBe(false);
    }
  });

  it("blocks the unspecified address and loopback in every spelling", () => {
    for (const address of ["::", "::1", "0:0:0:0:0:0:0:1", "0000::0001", "[::1]"]) expect(isPrivateAddress(address), address).toBe(true);
  });

  it("checks the IPv4 inside IPv4-mapped addresses, dotted and hex (the form WHATWG URL normalises to)", () => {
    expect(isPrivateAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateAddress("::ffff:7f00:1")).toBe(true);
    expect(isPrivateAddress("::FFFF:a9fe:a9fe")).toBe(true); // 169.254.169.254
    expect(isPrivateAddress("0:0:0:0:0:ffff:10.0.0.1")).toBe(true);
    expect(isPrivateAddress(new URL("http://[::ffff:127.0.0.1]/").hostname)).toBe(true);
    expect(isPrivateAddress("::ffff:8.8.8.8")).toBe(false);
    expect(isPrivateAddress("::ffff:808:808")).toBe(false);
    expect(isPrivateAddress("::127.0.0.1")).toBe(true); // deprecated IPv4-compatible
  });

  it("checks the IPv4 inside NAT64 (64:ff9b::/96) and 6to4 (2002::/16)", () => {
    expect(isPrivateAddress("64:ff9b::127.0.0.1")).toBe(true);
    expect(isPrivateAddress("64:ff9b::a00:1")).toBe(true); // 10.0.0.1
    expect(isPrivateAddress("64:ff9b::808:808")).toBe(false);
    expect(isPrivateAddress("64:ff9b:1::1")).toBe(true); // local-use NAT64
    expect(isPrivateAddress("2002:7f00:1::")).toBe(true); // 127.0.0.1
    expect(isPrivateAddress("2002:c0a8:101::1")).toBe(true); // 192.168.1.1
    expect(isPrivateAddress("2002:808:808::1")).toBe(false);
  });

  it("blocks unique-local, link-local, site-local, multicast, Teredo and documentation ranges", () => {
    for (const address of ["fc00::1", "fd12:3456::1", "fe80::1", "fe80::1%eth0", "febf::1", "fec0::1", "ff02::1", "ff05::2", "2001::1", "2001:db8::1", "100::1"]) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
  });

  it("allows public IPv6 and treats garbage as private", () => {
    for (const address of ["2606:4700:4700::1111", "2a00:1450:4001:80b::200e", "2001:4860:4860::8888"]) expect(isPrivateAddress(address), address).toBe(false);
    for (const address of ["", "example.com", "::ffff:999.0.0.1", "1::2::3"]) expect(isPrivateAddress(address), address).toBe(true);
  });
});

describe("parseIPv6", () => {
  it("expands every form to 16 bytes", () => {
    expect(Array.from(parseIPv6("::1")!)).toEqual([...Array(15).fill(0), 1]);
    expect(Array.from(parseIPv6("::ffff:1.2.3.4")!.subarray(10))).toEqual([0xff, 0xff, 1, 2, 3, 4]);
    expect(Array.from(parseIPv6("1:2:3:4:5:6:7:8")!.subarray(14))).toEqual([0, 8]);
    expect(Array.from(parseIPv6("2001:db8::")!.subarray(0, 4))).toEqual([0x20, 0x01, 0x0d, 0xb8]);
    expect(parseIPv6("127.0.0.1")).toBeNull();
  });
});

describe("safeFetch", () => {
  it("refuses names that resolve to a private address, on every redirect hop", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://internal.example/" } }));
    const resolve = vi.fn(async (host: string) => [{ address: host === "internal.example" ? "::ffff:7f00:1" : "93.184.216.34", family: host === "internal.example" ? 6 : 4 }]);
    await expect(safeFetch("https://public.example/", { fetchImpl, resolve: resolve as never })).rejects.toThrow("blocked: private address");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("refuses odd ports and protocols before any lookup", async () => {
    const resolve = vi.fn();
    await expect(safeFetch("http://example.com:8080/", { resolve: resolve as never })).rejects.toThrow("blocked: port");
    await expect(safeFetch("file:///etc/passwd", { resolve: resolve as never })).rejects.toThrow("blocked: protocol");
    expect(resolve).not.toHaveBeenCalled();
  });
});

describe("pinned connection (no second DNS lookup)", () => {
  it("the lookup always answers with the validated address", () => {
    const lookup = pinnedLookup({ address: "93.184.216.34", family: 4 });
    const single = vi.fn();
    lookup("rebind.example", {}, single);
    expect(single).toHaveBeenCalledWith(null, "93.184.216.34", 4);
    const all = vi.fn();
    lookup("rebind.example", { all: true }, all);
    expect(all).toHaveBeenCalledWith(null, [{ address: "93.184.216.34", family: 4 }]);
  });

  it("connects to the pinned address while keeping the original Host header", async () => {
    let seen: IncomingHttpHeaders | null = null;
    const server = createServer((request, response) => {
      seen = request.headers;
      response.writeHead(200, { "Content-Type": "text/html", "Content-Encoding": "gzip" }).end(gzipSync("<title>ok</title>"));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const { port } = server.address() as AddressInfo;
      // The name does not exist in DNS: the request can only arrive if the pinned address is used.
      const response = await requestPinned(new URL(`http://does-not-resolve.invalid:${port}/x`), { address: "127.0.0.1", family: 4 }, { signal: AbortSignal.timeout(5000), headers: {} });
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("<title>ok</title>");
      expect(seen!.host).toBe(`does-not-resolve.invalid:${port}`);
    } finally {
      server.close();
    }
  });
});
