import type { EvidenceRecord, EvidenceStore } from "./types";

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
