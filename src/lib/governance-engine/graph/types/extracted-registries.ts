// ENG-001A: Registry Extractor — Extracted Registry Types
// JSON structure matching SPEC-GOV-11 §4.5
// All types are derived representations of frozen Markdown registries

export interface ExtractedClaim {
  id: string; // CLM-{AREA}-{NNNN}
  version: string;
  type: string;
  origin: string;
  dimension: string;
  capRef: string | null;
  claimText: string;
  ka: string;
  product: string;
  auth: string;
  evidence: string[];
  confidence: string;
  completeness: string;
}

export interface ExtractedProduct {
  id: string; // PROD-{NAME}
  name: string;
  nameAr: string;
  entityType: string;
  ka: string;
  authority: string;
  currentLLevel: string;
  lLevelStatus: string;
  strategicIntent: string;
  parent: string | null;
  evidenceStatus: string;
  manifestStatus: string;
  dossierStatus: string;
  lastVerified: string;
}

export interface ExtractedDecision {
  id: string; // DEC-{YYYY}-{NNNN}
  type: string;
  title: string;
  authority: string;
  date: string;
  affected: string[];
  status: string;
}

export interface ExtractedEvidence {
  id: string; // EV-{NNNN}
  tier: string;
  description: string;
  supports: string[];
  score: number;
  sourceRef: string;
}

export interface ExtractedAuthority {
  id: string; // AUTH-{AREA}
  areaId: string;
  knowledgeArea: string;
  document: string;
  type: 'Authority' | 'Reference';
  secondaryRefs: string[];
  gap: string | null;
  notes: string | null;
}

export interface ExtractedRegistries {
  claims: ExtractedClaim[];
  products: ExtractedProduct[];
  decisions: ExtractedDecision[];
  evidence: ExtractedEvidence[];
  authorities: ExtractedAuthority[];
  metadata: {
    extractedAt: string;
    sourceFiles: {
      claims: string;
      products: string;
      decisions: string;
      evidence: string;
      authorities: string;
    };
    entityCounts: {
      claims: number;
      products: number;
      decisions: number;
      evidence: number;
      authorities: number;
    };
  };
}
