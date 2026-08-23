// ─── LocalContentOS — LCGPA Regulatory Intelligence Engine ───
//
// Continuous regulatory intelligence for the LCGPA Mandatory List and the
// regulations around it. Not a one-time import: a monitoring, versioning,
// diffing, impact-assessing, governed pipeline.
//
//   Source Registry → Source Monitor → Artifact Acquisition → Integrity
//   → Provenance → Versioning → Semantic Diff → Classification
//   → Effective Dates → Impact Analysis → Governance → Activation
//   → Alerts → Journal → Audit → Observability → Read Model
//
// Every module is pure and dependency-injected. The engine performs no network,
// database or filesystem I/O of its own.

export * from "./types";
export * from "./ids";
export * from "./integrity";
export * from "./source-registry";
export * from "./source-monitor";
export * from "./artifact-store";
export * from "./parser";
export * from "./parsers";
export * from "./fetchers";
export * from "./versioning";
export * from "./change-classification";
export * from "./semantic-diff";
export * from "./effective-date";
export * from "./effective-date-evidence";
export * from "./impact-analysis";
export * from "./governance";
export * from "./alerts";
export * from "./conflict-detection";
export * from "./change-journal";
export * from "./observability";
export * from "./calculation-binding";
export * from "./read-model";
export * from "./pipeline";
