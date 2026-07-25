export type EvidenceItem = {
  id: string;
  evidenceType: string;
  evidenceId: string;
  organizationId: string;
  accountCode: string;
  accountName: string | null;
  createdAt: string;
};

export type PromotionItem = {
  id: string;
  promotedBy: string;
  promotedAt: string;
  artifactType: string;
  artifactPath: string | null;
  notes: string | null;
};
