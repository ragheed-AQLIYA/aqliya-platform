export interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  exportType: string;
  organizationId: string;
  source: string;
  version: string;
  disclaimer: string;
}

export function buildExportMetadata(opts: {
  exportedBy: string;
  exportType: string;
  organizationId: string;
  source?: string;
}): ExportMetadata {
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: opts.exportedBy,
    exportType: opts.exportType,
    organizationId: opts.organizationId,
    source: opts.source || "local-contact",
    version: "1.0",
    disclaimer: "AI assists. Humans decide. Evidence governs.",
  };
}
