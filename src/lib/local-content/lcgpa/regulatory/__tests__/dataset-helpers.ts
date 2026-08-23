import type {
  RegulatoryDataset,
  RegulatoryProduct,
  RegulatoryProvenance,
  DatasetStatus,
} from "../types";
import { REGULATORY_PARSER_VERSION, REGULATORY_SCHEMA_VERSION } from "../types";
import { ACTIVE_RULE_VERSION } from "../versioning";

export function provenanceFor(
  datasetVersion: string,
  sha256: string,
): RegulatoryProvenance {
  return {
    sourceAuthority: "LCGPA",
    sourceId: "lcgpa-mandatory-list-documents",
    sourceUrl: "https://lcgpa.gov.sa/mandatory-list.csv",
    directArtifactUrl: "https://lcgpa.gov.sa/mandatory-list.csv",
    artifactFilename: "mandatory-list.csv",
    artifactSha256: sha256,
    artifactSize: 1024,
    acquiredAt: new Date("2026-08-21T02:00:00.000Z"),
    acquiredBy: "system:lcgpa-regulatory-monitor",
    publicationDate: new Date("2026-08-20T00:00:00.000Z"),
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    datasetVersion,
    documentVersion: datasetVersion,
    parserVersion: REGULATORY_PARSER_VERSION,
    schemaVersion: REGULATORY_SCHEMA_VERSION,
    ruleVersion: ACTIVE_RULE_VERSION,
  };
}

export function makeDataset(
  datasetVersion: string,
  products: RegulatoryProduct[],
  options: {
    sha256?: string;
    status?: DatasetStatus;
    effectiveFrom?: Date | null;
    effectiveTo?: Date | null;
    createdAt?: Date;
    activatedAt?: Date | null;
    sourceId?: string;
  } = {},
): RegulatoryDataset {
  const sha256 = options.sha256 ?? datasetVersion.padEnd(64, "0").slice(0, 64);
  return {
    datasetId: `DS-${datasetVersion}`,
    datasetVersion,
    documentVersionId: `DOCV-${datasetVersion}`,
    sourceId: options.sourceId ?? "lcgpa-mandatory-list-documents",
    artifactSha256: sha256,
    products: products
      .slice()
      .sort((a, b) => a.productCode.localeCompare(b.productCode)),
    parserVersion: REGULATORY_PARSER_VERSION,
    schemaVersion: REGULATORY_SCHEMA_VERSION,
    ruleVersion: ACTIVE_RULE_VERSION,
    status: options.status ?? "ACTIVE",
    effectiveFrom:
      options.effectiveFrom === undefined
        ? new Date("2026-01-01T00:00:00.000Z")
        : options.effectiveFrom,
    effectiveTo: options.effectiveTo ?? null,
    createdAt: options.createdAt ?? new Date("2026-08-21T02:00:00.000Z"),
    activatedAt: options.activatedAt ?? null,
    deactivatedAt: null,
    provenance: provenanceFor(datasetVersion, sha256),
  };
}
