// Governance Engine — Relationship Types
// M2 Baseline v1.2 (Frozen) — C01–C21
// DO NOT MODIFY

export type RelationshipCardinality = '1:1' | '1:N' | 'N:1' | 'N:M';

export interface RelationshipDefinition {
  id: string; // C01–C21
  sourceEntity: string;
  relationship: string;
  targetEntity: string;
  cardinality: RelationshipCardinality;
  description: string;
}

export interface RelationshipValidationResult {
  relationshipId: string;
  status: 'valid' | 'violation';
  sourceCount: number;
  targetCount: number;
  expected: RelationshipCardinality;
  violations: string[];
}

// C01–C21 Definitions
export const RELATIONSHIPS: Record<string, RelationshipDefinition> = {
  C01: { id: 'C01', sourceEntity: 'KnowledgeArea', relationship: 'has_many', targetEntity: 'Product', cardinality: '1:N', description: 'One area contains many products' },
  C02: { id: 'C02', sourceEntity: 'KnowledgeArea', relationship: 'has_many', targetEntity: 'Claim', cardinality: '1:N', description: 'One area contains many claims' },
  C03: { id: 'C03', sourceEntity: 'KnowledgeArea', relationship: 'has_many', targetEntity: 'Authority', cardinality: '1:N', description: 'One area may have multiple authorities' },
  C04: { id: 'C04', sourceEntity: 'Product', relationship: 'has_many', targetEntity: 'Claim', cardinality: '1:N', description: 'One product has many claims' },
  C05: { id: 'C05', sourceEntity: 'Product', relationship: 'belongs_to', targetEntity: 'KnowledgeArea', cardinality: 'N:1', description: 'Products belong to one area each' },
  C06: { id: 'C06', sourceEntity: 'Claim', relationship: 'references', targetEntity: 'Evidence', cardinality: 'N:M', description: 'Many claims reference many evidence items' },
  C07: { id: 'C07', sourceEntity: 'Claim', relationship: 'has_authority', targetEntity: 'Authority', cardinality: 'N:1', description: 'Many claims governed by one authority' },
  C08: { id: 'C08', sourceEntity: 'Claim', relationship: 'results_in', targetEntity: 'Decision', cardinality: '1:1', description: 'Each claim has one current decision' },
  C09: { id: 'C09', sourceEntity: 'Claim', relationship: 'contained_in', targetEntity: 'Document', cardinality: 'N:M', description: 'Claims may appear in multiple documents' },
  C10: { id: 'C10', sourceEntity: 'Evidence', relationship: 'sourced_from', targetEntity: 'Source', cardinality: 'N:1', description: 'Many evidence items come from one source' },
  C11: { id: 'C11', sourceEntity: 'Source', relationship: 'contained_in', targetEntity: 'Document', cardinality: 'N:M', description: 'Sources may appear in multiple documents' },
  C12: { id: 'C12', sourceEntity: 'Evidence', relationship: 'has_type', targetEntity: 'Tier', cardinality: 'N:1', description: 'Each evidence has one T1-T7 type' },
  C13: { id: 'C13', sourceEntity: 'Authority', relationship: 'governs', targetEntity: 'Claim', cardinality: '1:N', description: 'One authority governs many claims' },
  C14: { id: 'C14', sourceEntity: 'Authority', relationship: 'supersedes', targetEntity: 'Authority', cardinality: 'N:1', description: 'Authorities form a supersession chain' },
  C15: { id: 'C15', sourceEntity: 'Decision', relationship: 'approved_by', targetEntity: 'Reviewer', cardinality: 'N:1', description: 'Many decisions by one reviewer' },
  C16: { id: 'C16', sourceEntity: 'Decision', relationship: 'based_on', targetEntity: 'Evidence', cardinality: '1:N', description: 'One decision references multiple evidence' },
  C17: { id: 'C17', sourceEntity: 'Review', relationship: 'produces', targetEntity: 'Finding', cardinality: '1:N', description: 'One review produces many findings' },
  C18: { id: 'C18', sourceEntity: 'Finding', relationship: 'references', targetEntity: 'Claim', cardinality: 'N:1', description: 'Many findings reference one claim' },
  C19: { id: 'C19', sourceEntity: 'Finding', relationship: 'recommends', targetEntity: 'Decision', cardinality: 'N:1', description: 'Many findings recommend one decision' },
  C20: { id: 'C20', sourceEntity: 'Manifest', relationship: 'aggregates', targetEntity: 'Claim', cardinality: '1:N', description: 'One manifest aggregates many claims' },
  C21: { id: 'C21', sourceEntity: 'Dossier', relationship: 'extends', targetEntity: 'Manifest', cardinality: '1:1', description: 'One dossier extends one manifest' },
};
