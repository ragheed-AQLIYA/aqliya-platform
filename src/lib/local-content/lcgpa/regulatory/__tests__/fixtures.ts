// Shared deterministic fixtures for the LCGPA Regulatory Intelligence tests.
// No network, no filesystem, no randomness, no wall clock.

import type {
  Clock,
  FetchedResource,
  RegulatoryFetcher,
  RegulatoryProduct,
  RegulatorySource,
  ImpactResolver,
  AffectedEntities,
} from "../types";
import { fixedClock } from "../types";
import { createSource } from "../source-registry";
import { verifySource } from "../source-registry";

export const T0 = new Date("2026-08-21T02:00:00.000Z");

export function clockAt(iso: string): Clock {
  return fixedClock(new Date(iso));
}

/** Clock that advances a fixed step on every read — for lifecycle ordering. */
export function steppingClock(startIso: string, stepMs = 1000): Clock {
  let t = new Date(startIso).getTime();
  return {
    now: () => {
      const d = new Date(t);
      t += stepMs;
      return d;
    },
  };
}

// ─── Sources ───

export function tier1Source(overrides: Partial<RegulatorySource> = {}): RegulatorySource {
  const base = createSource(
    {
      id: "lcgpa-mandatory-list-documents",
      authority: "LCGPA",
      name: "LCGPA Mandatory List",
      description: "Official mandatory list artifact",
      url: "https://lcgpa.gov.sa/mandatory-list.csv",
      sourceType: "CSV",
      authorityTier: 1,
      monitoringMethod: "FILE_FINGERPRINT",
      checkFrequency: "DAILY",
    },
    clockAt("2026-01-01T00:00:00.000Z"),
  );
  return { ...base, ...overrides };
}

export function verifiedTier1Source(
  overrides: Partial<RegulatorySource> = {},
): RegulatorySource {
  const verified = verifySource(tier1Source(), {
    verifiedById: "user-reg-officer-1",
    verifiedAt: new Date("2026-01-02T00:00:00.000Z"),
    evidence: "Operator confirmed canonical artifact URL from the LCGPA documents library.",
    confirmedUrl: "https://lcgpa.gov.sa/mandatory-list.csv",
  });
  return { ...verified, ...overrides };
}

export function tier2Source(overrides: Partial<RegulatorySource> = {}): RegulatorySource {
  const base = createSource(
    {
      id: "spa-announcements",
      authority: "Saudi Press Agency",
      name: "SPA announcements",
      description: "Official announcements",
      url: "https://www.spa.gov.sa/en/N2514218",
      sourceType: "ANNOUNCEMENT",
      authorityTier: 2,
      monitoringMethod: "CONTENT_HASH",
      checkFrequency: "DAILY",
    },
    clockAt("2026-01-01T00:00:00.000Z"),
  );
  return { ...base, ...overrides };
}

export function tier4Source(overrides: Partial<RegulatorySource> = {}): RegulatorySource {
  const base = createSource(
    {
      id: "third-party-tracker",
      authority: "Third Party",
      name: "Commercial tracker",
      description: "Discovery only",
      url: "https://example.com/tracker",
      sourceType: "WEB_PAGE",
      authorityTier: 4,
      monitoringMethod: "CONTENT_HASH",
      checkFrequency: "WEEKLY",
    },
    clockAt("2026-01-01T00:00:00.000Z"),
  );
  return { ...base, ...overrides };
}

// ─── Fetcher doubles ───

export function okResource(
  body: Buffer,
  headers: Record<string, string> = {},
  finalUrl = "https://lcgpa.gov.sa/mandatory-list.csv",
): FetchedResource {
  return {
    ok: true,
    status: 200,
    headers: { "content-type": "text/csv", ...headers },
    body,
    finalUrl,
  };
}

export function failedResource(
  status: number,
  errorCode: string,
  errorMessage = "unreachable",
): FetchedResource {
  return {
    ok: false,
    status,
    headers: {},
    body: null,
    finalUrl: "https://lcgpa.gov.sa/mandatory-list.csv",
    errorCode,
    errorMessage,
  };
}

/** Fetcher that replays a fixed sequence of responses per URL. */
export function sequenceFetcher(
  responses: FetchedResource[],
): RegulatoryFetcher & { calls: string[] } {
  let i = 0;
  const calls: string[] = [];
  return {
    calls,
    async fetch(url: string) {
      calls.push(url);
      const r = responses[Math.min(i, responses.length - 1)];
      i++;
      return r;
    },
  };
}

/** Fetcher that always throws — simulates a network-level failure. */
export function throwingFetcher(message = "ECONNRESET"): RegulatoryFetcher {
  return {
    async fetch() {
      throw new Error(message);
    },
  };
}

// ─── Products & CSV artifacts ───

export function product(
  code: string,
  overrides: Partial<RegulatoryProduct> = {},
): RegulatoryProduct {
  return {
    productCode: code,
    productNameAr: `منتج ${code}`,
    productNameEn: `Product ${code}`,
    sectorCode: "S01",
    sectorNameAr: "قطاع",
    sectorNameEn: "Sector",
    category: "CAT-A",
    hsCode: "690721",
    minimumLcPct: 40,
    requirements: ["LC_CERTIFICATE"],
    applicability: "Government procurement",
    regulatoryStatus: "ACTIVE",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    ...overrides,
  };
}

export const CSV_HEADER =
  "code,name_ar,name_en,sector,sector_ar,category,hs,min_lc,applicability,effective_from,effective_to,cert";

export const CSV_MAPPING = {
  productCode: "code",
  productNameAr: "name_ar",
  productNameEn: "name_en",
  sectorCode: "sector",
  sectorNameAr: "sector_ar",
  category: "category",
  hsCode: "hs",
  minimumLcPct: "min_lc",
  applicability: "applicability",
  effectiveFrom: "effective_from",
  effectiveTo: "effective_to",
  requirementColumns: ["cert"],
};

export function csvRow(
  code: string,
  opts: {
    nameAr?: string;
    nameEn?: string;
    sector?: string;
    category?: string;
    hs?: string;
    minLc?: string;
    applicability?: string;
    from?: string;
    to?: string;
    cert?: string;
  } = {},
): string {
  return [
    code,
    opts.nameAr ?? `منتج ${code}`,
    opts.nameEn ?? `Product ${code}`,
    opts.sector ?? "S01",
    "قطاع",
    opts.category ?? "CAT-A",
    opts.hs ?? "690721",
    opts.minLc ?? "40",
    opts.applicability ?? "Government procurement",
    opts.from ?? "2026-01-01",
    opts.to ?? "",
    opts.cert ?? "LC_CERTIFICATE",
  ].join(",");
}

export function csvArtifact(rows: string[]): Buffer {
  return Buffer.from([CSV_HEADER, ...rows].join("\n"), "utf8");
}

// ─── ZIP builder (for OOXML integrity tests) ───

export interface ZipFixtureEntry {
  name: string;
  content: string;
  /** Override the declared uncompressed size (to simulate a ZIP bomb). */
  fakeUncompressedSize?: number;
  /** Override the declared compressed size. */
  fakeCompressedSize?: number;
}

/** Build a structurally valid STORED (uncompressed) ZIP container. */
export function makeZip(entries: ZipFixtureEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const dataBuf = Buffer.from(entry.content, "utf8");
    const compSize = entry.fakeCompressedSize ?? dataBuf.length;
    const uncompSize = entry.fakeUncompressedSize ?? dataBuf.length;

    const local = Buffer.alloc(30 + nameBuf.length + dataBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(compSize, 18);
    local.writeUInt32LE(uncompSize, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    dataBuf.copy(local, 30 + nameBuf.length);
    locals.push(local);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(compSize, 20);
    central.writeUInt32LE(uncompSize, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralBuf, eocd]);
}

/** A minimal, clean OOXML workbook container. */
export function cleanXlsx(): Buffer {
  return makeZip([
    { name: "[Content_Types].xml", content: "<Types/>" },
    { name: "xl/workbook.xml", content: "<workbook/>" },
    { name: "xl/worksheets/sheet1.xml", content: "<worksheet/>" },
  ]);
}

// ─── Impact resolver doubles ───

export function resolverReturning(affected: Partial<AffectedEntities>): ImpactResolver {
  return {
    async findAffected() {
      return {
        calculationIds: [],
        projectIds: [],
        tenderIds: [],
        supplierIds: [],
        contractIds: [],
        reportIds: [],
        complianceAssessmentIds: [],
        ...affected,
      };
    },
  };
}

export function ids(prefix: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => `${prefix}-${i + 1}`);
}
