const fs = require("fs");
const path = require("path");

const files = {
  "src/core/evidence/types.ts": `export type EvidenceCategory = "document" | "source_record" | "report" | "note" | string;

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
`,
  "src/core/evidence/evidence-store.ts": `import type { EvidenceRecord, EvidenceStore } from "./types";

export class InMemoryEvidenceStore implements EvidenceStore {
  private records = new Map<string, EvidenceRecord>();

  async getById(id: string) {
    return this.records.get(id) ?? null;
  }

  async create(record: EvidenceRecord) {
    this.records.set(record.id, { ...record });
  }

  async update(id: string, patch: Partial<EvidenceRecord>) {
    const existing = this.records.get(id);
    if (existing) this.records.set(id, { ...existing, ...patch });
  }

  async link() {}
}
`,
  "src/core/evidence/evidence-store-prisma.ts": `import { InMemoryEvidenceStore } from "./evidence-store";

export class PrismaEvidenceStore extends InMemoryEvidenceStore {}
`,
};

for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("Fixed", Object.keys(files).length, "core evidence files");
