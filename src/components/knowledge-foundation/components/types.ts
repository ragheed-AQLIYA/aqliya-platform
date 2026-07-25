export type EligibleCandidateOption = {
  id: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  promotedAt: string | null;
  evidenceCount: number;
};
