/**
 * Centralized SSRF protection for user-controlled outbound URLs.
 *
 * Hostname string matching is not sufficient: DNS may resolve to private
 * addresses (including after redirect). Every hop is resolved and checked.
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data",
]);

const BLOCKED_HOST_SUFFIXES = [".internal", ".local", ".localhost", ".lan"];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((nums[0]! << 24) | (nums[1]! << 16) | (nums[2]! << 8) | nums[3]!) >>> 0;
}

function isBlockedIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true;
  const inRange = (start: string, end: string) => {
    const a = ipv4ToInt(start);
    const b = ipv4ToInt(end);
    if (a === null || b === null) return true;
    return n >= a && n <= b;
  };
  return (
    inRange("0.0.0.0", "0.255.255.255") ||
    inRange("10.0.0.0", "10.255.255.255") ||
    inRange("127.0.0.0", "127.255.255.255") ||
    inRange("169.254.0.0", "169.254.255.255") ||
    inRange("172.16.0.0", "172.31.255.255") ||
    inRange("192.168.0.0", "192.168.255.255") ||
    inRange("100.64.0.0", "100.127.255.255") ||
    inRange("198.18.0.0", "198.19.255.255") ||
    inRange("224.0.0.0", "255.255.255.255")
  );
}

function expandIPv6(ip: string): string[] | null {
  const raw = ip.toLowerCase().trim();
  if (raw.includes(".")) {
    const lastColon = raw.lastIndexOf(":");
    const v4 = raw.slice(lastColon + 1);
    if (isIP(v4) === 4) {
      const head = raw.slice(0, lastColon);
      const mapped = expandIPv6(head.endsWith(":") ? `${head}:0` : `${head}:0`);
      return mapped;
    }
  }
  const parts = raw.split("::");
  if (parts.length > 2) return null;
  const left = parts[0] ? parts[0].split(":").filter(Boolean) : [];
  const right = parts[1] ? parts[1].split(":").filter(Boolean) : [];
  if (left.length + right.length > 8) return null;
  const mid = Array(8 - left.length - right.length).fill("0");
  return [...left, ...mid, ...right].map((h) => h.padStart(4, "0"));
}

function ipv6HextetsToMappedIPv4(hextets: string[]): string | null {
  const isMapped =
    hextets.slice(0, 5).every((h) => h === "0000") && hextets[5] === "ffff";
  if (!isMapped) return null;
  const hi = parseInt(hextets[6] ?? "0", 16);
  const lo = parseInt(hextets[7] ?? "0", 16);
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
}

function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (isIP(mapped) === 4) return isBlockedIPv4(mapped);
  }
  const hextets = expandIPv6(normalized);
  if (!hextets || hextets.length !== 8) return true;
  const mapped = ipv6HextetsToMappedIPv4(hextets);
  if (mapped) return isBlockedIPv4(mapped);
  const first = parseInt(hextets[0] ?? "0", 16);
  if (Number.isNaN(first)) return true;
  if (hextets.every((h) => h === "0000")) return true; // ::
  if (hextets.slice(0, 7).every((h) => h === "0000") && hextets[7] === "0001") {
    return true; // ::1
  }
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return true; // multicast
  return false;
}

export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isBlockedIPv4(ip);
  if (version === 6) return isBlockedIPv6(ip);
  return true;
}

function hostIsBlockedName(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if (host.endsWith(".metadata.google.internal")) return true;
  return false;
}

export async function assertSafeOutboundUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("URL protocol not allowed");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URL credentials are not allowed");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostIsBlockedName(hostname)) {
    throw new Error("URL host is not allowed");
  }

  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
    throw new Error("URL resolves to a blocked address");
  }

  if (isIP(hostname)) {
    if (isBlockedIpAddress(hostname)) {
      throw new Error("URL resolves to a blocked address");
    }
    return parsed;
  }

  let addresses: string[];
  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    addresses = records.map((r) => r.address);
  } catch {
    throw new Error("URL host could not be resolved");
  }

  if (addresses.length === 0 || addresses.some((ip) => isBlockedIpAddress(ip))) {
    throw new Error("URL resolves to a blocked address");
  }

  return parsed;
}

const MAX_REDIRECTS = 3;

/**
 * POST JSON to a user-controlled URL after SSRF checks.
 * Redirects are not followed automatically; each Location is revalidated.
 */
export async function safeFetchJson(
  rawUrl: string,
  init: Omit<RequestInit, "redirect"> & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 15000, ...rest } = init;
  let current = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = await assertSafeOutboundUrl(current);
    const response = await fetch(parsed.toString(), {
      ...rest,
      redirect: "manual",
      signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect missing Location header");
      }
      current = new URL(location, parsed).toString();
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}
