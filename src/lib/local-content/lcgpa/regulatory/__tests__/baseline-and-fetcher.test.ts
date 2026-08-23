import { buildDiffAlerts } from "../alerts";
import { classifyChange } from "../change-classification";
import { computeSemanticDiff } from "../semantic-diff";
import {
  cookieHeader,
  createBufferFetcher,
  createHttpFetcher,
  mergeCookies,
} from "../fetchers/http-fetcher";
import { clockAt, product, verifiedTier1Source } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-08-22T02:00:00.000Z");
const HISTORIC = new Date("2020-04-07T00:00:00.000Z");

describe("LCGPA regulatory :: baseline is not a regulatory change", () => {
  const baseline = computeSemanticDiff({
    before: null,
    after: makeDataset("v1", [
      product("1", { effectiveFrom: HISTORIC }),
      product("2", { effectiveFrom: HISTORIC }),
    ]),
    clock: CLOCK,
  });

  it("marks a first observation as a baseline", () => {
    expect(baseline.isBaseline).toBe(true);
    expect(baseline.datasetBefore).toBeNull();
  });

  it("does NOT escalate historical effective dates to CRITICAL on a baseline", () => {
    expect(baseline.summary.bySeverity.CRITICAL).toBe(0);
    expect(baseline.summary.bySeverity.HIGH).toBe(2);
  });

  it("STILL escalates a retroactive change once a baseline exists", () => {
    const change = computeSemanticDiff({
      before: makeDataset("v1", [product("1", { minimumLcPct: 40 })]),
      after: makeDataset("v2", [
        product("1", { minimumLcPct: 50, effectiveFrom: HISTORIC }),
      ]),
      clock: CLOCK,
    });
    expect(change.isBaseline).toBe(false);
    expect(change.summary.bySeverity.CRITICAL).toBeGreaterThan(0);
  });

  it("suppresses the retroactive rule only for the baseline flag", () => {
    const ctx = {
      oldValue: "S01",
      newValue: "S02",
      effectiveFrom: HISTORIC,
      detectedAt: new Date("2026-08-22T00:00:00.000Z"),
    };
    expect(classifyChange("SECTOR_CHANGED", ctx).severity).toBe("CRITICAL");
    expect(classifyChange("SECTOR_CHANGED", { ...ctx, isBaseline: true }).severity).toBe(
      "MEDIUM",
    );
  });

  it("raises ONE baseline alert, not one per product", () => {
    const alerts = buildDiffAlerts({
      source: verifiedTier1Source(),
      diff: baseline,
      impact: null,
      clock: CLOCK,
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe("NEW_REGULATION");
    expect(alerts[0].severity).toBe("MEDIUM");
    expect(alerts[0].summary).toMatch(/Baseline established/);
    expect(alerts[0].summary).toMatch(/not a change/);
  });
});

describe("LCGPA regulatory :: HTTP fetcher", () => {
  it("REFUSES a non-https URL", async () => {
    const r = await createHttpFetcher().fetch("http://lcgpa.gov.sa/file");
    expect(r.ok).toBe(false);
    expect(r.errorCode).toBe("INSECURE_SCHEME");
  });

  it("REFUSES a malformed URL", async () => {
    const r = await createHttpFetcher().fetch("not a url");
    expect(r.errorCode).toBe("INVALID_URL");
  });

  it("performs a session handshake before fetching a Mendix document", async () => {
    const calls: { url: string; cookie?: string }[] = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      const headers = (init?.headers ?? {}) as Record<string, string>;
      calls.push({ url, cookie: headers.cookie });
      if (url.endsWith("/")) {
        return new Response("<html/>", {
          status: 200,
          headers: { "set-cookie": "XASSESSIONID=abc123; Path=/; HttpOnly" },
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      });
    }) as unknown as typeof fetch;

    const fetcher = createHttpFetcher({ fetchImpl });
    const r = await fetcher.fetch("https://lcgpa.gov.sa/file?guid=1&changedDate=2");
    expect(r.ok).toBe(true);
    expect(calls[0].url).toBe("https://lcgpa.gov.sa/");
    expect(calls[1].cookie).toBe("XASSESSIONID=abc123");
    expect(r.body?.length).toBe(3);
  });

  it("reports an HTTP failure without a body", async () => {
    const fetchImpl = (async (url: string) =>
      url.endsWith("/")
        ? new Response("", { status: 200 })
        : new Response("denied", { status: 401 })) as unknown as typeof fetch;
    const r = await createHttpFetcher({ fetchImpl }).fetch("https://lcgpa.gov.sa/file?guid=1");
    expect(r.ok).toBe(false);
    expect(r.status).toBe(401);
    expect(r.errorCode).toBe("HTTP_401");
    expect(r.body).toBeNull();
  });

  it("REFUSES an artifact larger than the ceiling", async () => {
    const fetchImpl = (async (url: string) =>
      url.endsWith("/")
        ? new Response("", { status: 200 })
        : new Response(new Uint8Array(50), {
            status: 200,
            headers: { "content-length": "50" },
          })) as unknown as typeof fetch;
    const r = await createHttpFetcher({ fetchImpl, maxBytes: 10 }).fetch(
      "https://lcgpa.gov.sa/file?guid=1",
    );
    expect(r.errorCode).toBe("ARTIFACT_TOO_LARGE");
  });

  it("reports a network error rather than throwing", async () => {
    const fetchImpl = (async () => {
      throw new Error("ENOTFOUND");
    }) as unknown as typeof fetch;
    const r = await createHttpFetcher({ fetchImpl, sessionOrigins: [] }).fetch(
      "https://lcgpa.gov.sa/file?guid=1",
    );
    expect(r.errorCode).toBe("NETWORK_ERROR");
    expect(r.errorMessage).toBe("ENOTFOUND");
  });

  it("merges and renders cookies", () => {
    const jar = mergeCookies(new Map(), [
      "A=1; Path=/; HttpOnly",
      "B=2; Secure",
      "malformed",
    ]);
    expect(cookieHeader(jar)).toBe("A=1; B=2");
  });
});

describe("LCGPA regulatory :: preserved-artifact fetcher", () => {
  it("replays exactly the preserved bytes", async () => {
    const body = Buffer.from("official bytes");
    const fetcher = createBufferFetcher({
      "https://lcgpa.gov.sa/file?guid=1": {
        body,
        headers: { "content-disposition": 'attachment; filename="list.xlsx"' },
      },
    });
    const r = await fetcher.fetch("https://lcgpa.gov.sa/file?guid=1");
    expect(r.ok).toBe(true);
    expect(r.body?.equals(body)).toBe(true);
  });

  it("reports a miss rather than inventing content", async () => {
    const r = await createBufferFetcher({}).fetch("https://lcgpa.gov.sa/file?guid=9");
    expect(r.ok).toBe(false);
    expect(r.errorCode).toBe("NOT_IN_ARCHIVE");
    expect(r.body).toBeNull();
  });
});
