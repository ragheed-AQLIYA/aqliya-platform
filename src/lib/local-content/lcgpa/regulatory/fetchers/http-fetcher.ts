// ─── LCGPA Regulatory Intelligence :: HTTP fetchers ───
//
// The engine performs no I/O of its own; these are the adapters that satisfy
// the `RegulatoryFetcher` port.
//
// MENDIX SESSION REQUIREMENT (verified 2026-08-22): lcgpa.gov.sa serves its
// published documents from `/file?guid=…&changedDate=…`, and that endpoint
// answers HTTP 401 to a request without a Mendix runtime session cookie. The
// fetcher therefore performs a session handshake against the application root
// and replays the resulting cookies. This is exactly what a browser does; it
// is not an authentication bypass — the documents are public.

import type { FetchedResource, RegulatoryFetcher } from "../types";

export const DEFAULT_USER_AGENT =
  "AQLIYA-LocalContentOS/1.0 (LCGPA regulatory monitor; +https://aqliya.sa)";

export interface HttpFetcherOptions {
  /** Milliseconds before a request is abandoned. */
  timeoutMs?: number;
  userAgent?: string;
  /** Maximum bytes accepted for a single artifact. */
  maxBytes?: number;
  /** Origins for which a session handshake is performed before the request. */
  sessionOrigins?: string[];
  /** Injected for tests. Defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

function headerRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/** Merge Set-Cookie values into a cookie jar keyed by cookie name. */
export function mergeCookies(
  jar: Map<string, string>,
  setCookie: string[],
): Map<string, string> {
  for (const raw of setCookie) {
    const pair = raw.split(";", 1)[0];
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  return jar;
}

export function cookieHeader(jar: Map<string, string>): string {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function readSetCookie(headers: Headers): string[] {
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") return anyHeaders.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

/**
 * HTTP fetcher with per-origin session handling.
 * Never follows a redirect to a different scheme than https.
 */
export function createHttpFetcher(
  options: HttpFetcherOptions = {},
): RegulatoryFetcher {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const sessionOrigins = new Set(options.sessionOrigins ?? ["https://lcgpa.gov.sa"]);
  const doFetch = options.fetchImpl ?? fetch;
  const jars = new Map<string, Map<string, string>>();

  async function handshake(origin: string): Promise<void> {
    if (jars.has(origin)) return;
    const jar = new Map<string, string>();
    jars.set(origin, jar);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await doFetch(`${origin}/`, {
        headers: { "user-agent": userAgent, accept: "text/html,*/*" },
        signal: controller.signal,
        redirect: "follow",
      });
      mergeCookies(jar, readSetCookie(res.headers));
      // Drain so the connection is released.
      await res.arrayBuffer().catch(() => undefined);
    } catch {
      // A failed handshake is not fatal; the request below will report the error.
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async fetch(url: string): Promise<FetchedResource> {
      let origin: string;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") {
          return {
            ok: false,
            status: 0,
            headers: {},
            body: null,
            finalUrl: url,
            errorCode: "INSECURE_SCHEME",
            errorMessage: `refusing to fetch a regulatory artifact over ${parsed.protocol}`,
          };
        }
        origin = parsed.origin;
      } catch {
        return {
          ok: false,
          status: 0,
          headers: {},
          body: null,
          finalUrl: url,
          errorCode: "INVALID_URL",
          errorMessage: `not a URL: ${url}`,
        };
      }

      if (sessionOrigins.has(origin)) await handshake(origin);
      const jar = jars.get(origin);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await doFetch(url, {
          headers: {
            "user-agent": userAgent,
            accept: "*/*",
            ...(jar && jar.size > 0 ? { cookie: cookieHeader(jar) } : {}),
            ...(sessionOrigins.has(origin) ? { referer: `${origin}/` } : {}),
          },
          signal: controller.signal,
          redirect: "follow",
        });
        if (jar) mergeCookies(jar, readSetCookie(res.headers));

        const declared = Number(res.headers.get("content-length") ?? "");
        if (Number.isFinite(declared) && declared > maxBytes) {
          return {
            ok: false,
            status: res.status,
            headers: headerRecord(res.headers),
            body: null,
            finalUrl: res.url || url,
            errorCode: "ARTIFACT_TOO_LARGE",
            errorMessage: `declared ${declared} bytes exceeds ${maxBytes}`,
          };
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > maxBytes) {
          return {
            ok: false,
            status: res.status,
            headers: headerRecord(res.headers),
            body: null,
            finalUrl: res.url || url,
            errorCode: "ARTIFACT_TOO_LARGE",
            errorMessage: `received ${buffer.length} bytes exceeds ${maxBytes}`,
          };
        }

        return {
          ok: res.ok,
          status: res.status,
          headers: headerRecord(res.headers),
          body: res.ok ? buffer : null,
          finalUrl: res.url || url,
          ...(res.ok ? {} : { errorCode: `HTTP_${res.status}` }),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const aborted = err instanceof Error && err.name === "AbortError";
        return {
          ok: false,
          status: 0,
          headers: {},
          body: null,
          finalUrl: url,
          errorCode: aborted ? "TIMEOUT" : "NETWORK_ERROR",
          errorMessage: message,
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Fetcher that replays preserved raw bytes.
 *
 * Used to reproduce a historical dataset from an archived artifact, and to
 * ingest an artifact that was retrieved out of band. It never invents metadata:
 * the caller supplies exactly the headers the original response carried.
 */
export function createBufferFetcher(
  entries: Record<string, { body: Buffer; headers?: Record<string, string>; finalUrl?: string }>,
): RegulatoryFetcher {
  return {
    async fetch(url: string): Promise<FetchedResource> {
      const entry = entries[url];
      if (!entry) {
        return {
          ok: false,
          status: 404,
          headers: {},
          body: null,
          finalUrl: url,
          errorCode: "NOT_IN_ARCHIVE",
          errorMessage: `no preserved artifact for ${url}`,
        };
      }
      return {
        ok: true,
        status: 200,
        headers: entry.headers ?? {},
        body: entry.body,
        finalUrl: entry.finalUrl ?? url,
      };
    },
  };
}
