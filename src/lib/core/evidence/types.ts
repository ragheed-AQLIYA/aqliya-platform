export type EvidenceCategory = "document" | "source_record" | "report" | "note" | string;

export interface EvidenceRecord {
  id: string;
  tenantId: string;
  productKey: string;
  category: EvidenceCategory;
  status: string;
  title?: string;
  description?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  createdById?: string;
}

export interface EvidenceStore {
  getById(id: string): Promise<EvidenceRecord | null>;
  create(record: EvidenceRecord): Promise<void>;
  update(id: string, patch: Partial<EvidenceRecord>): Promise<void>;
  link(coreId: string, targetType: string, targetId: string, relationship: string): Promise<void>;
}
