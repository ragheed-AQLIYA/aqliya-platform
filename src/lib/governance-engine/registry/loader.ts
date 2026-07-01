import type {
  GovernanceRegistries,
  Claim,
  Evidence,
  Product,
  Decision,
  Authority,
  Source,
  Review,
  Finding,
  Manifest,
  Dossier,
  KnowledgeArea,
} from '../types/entities';
import { ID_PATTERNS } from '../types/identifiers';
import { RegistryError, FreezeViolation } from '../types/errors';
import { parseClaimRegistry, parseEvidenceFromClaimRegistry, parseSourcesFromClaimRegistry } from './claim-registry';
import { parseProductRegistry } from './product-registry';
import { parseDecisionRegistry } from './decision-registry';

function createEmptyRegistries(): GovernanceRegistries {
  return {
    products: [],
    claims: [],
    evidence: [],
    sources: [],
    authorities: [],
    decisions: [],
    reviews: [],
    findings: [],
    manifests: [],
    dossiers: [],
    knowledgeAreas: [],
    frozen: false,
  };
}

function extractIdsByPattern(markdown: string, pattern: RegExp): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

function buildAuthorityFromMarkdown(markdown: string): Authority[] {
  const ids = extractIdsByPattern(markdown, /(AUTH-[A-Z][A-Z0-9-]*)\b/g);
  return ids.map((id) => ({
    id,
    version: '1.0',
    knowledgeArea: '',
    document: '',
    type: 'Authority' as const,
    chainPosition: 0,
  }));
}

function buildKnowledgeAreasFromMarkdown(markdown: string): KnowledgeArea[] {
  const ids = extractIdsByPattern(markdown, /\b(KA-\d{2})\b/g);
  return ids.map((id) => ({ id, name: id }));
}

export class RegistryLoader {
  private registries: GovernanceRegistries;
  private loaded: boolean;

  constructor() {
    this.registries = createEmptyRegistries();
    this.loaded = false;
  }

  async load(basePath: string): Promise<GovernanceRegistries> {
    if (this.loaded) {
      throw new FreezeViolation('RegistryLoader', 'load() called after registries were already loaded');
    }

    this.registries = await this.loadAll(basePath);
    this.loaded = true;
    return this.registries;
  }

  private async loadAll(basePath: string): Promise<GovernanceRegistries> {
    const registries = createEmptyRegistries();

    registries.products = await this.loadProducts(basePath);
    registries.decisions = await this.loadDecisions(basePath);

    const claimContent = await this.readFile(basePath, 'CLAIM_REGISTRY.md');
    registries.claims = parseClaimRegistry(claimContent);

    const rawEvidence = parseEvidenceFromClaimRegistry(claimContent);
    registries.evidence = rawEvidence.map((re) => ({
      id: re.id,
      version: '1.0',
      tier: re.tier as Evidence['tier'],
      strength: 'Moderate' as Evidence['strength'],
      reusable: false,
      description: re.description,
      sourceRef: re.sourceRef,
      score: re.score,
      supportsClaims: re.supportsClaims,
      freshness: {
        evidenceDate: new Date().toISOString(),
        commit: '',
        verificationDate: new Date().toISOString(),
        reviewer: '',
        expires: new Date().toISOString(),
      },
    }));

    const rawSources = parseSourcesFromClaimRegistry(claimContent);
    registries.sources = rawSources.map((rs) => {
      const sourceType = parseSourceType(rs.type);
      return {
        id: rs.id,
        version: '1.0',
        type: sourceType,
        location: rs.location,
        description: rs.location,
        producesEvidence: rs.producesEvidence,
        containedIn: [],
      };
    });

    const productContent = await this.readFile(basePath, 'product-registry.md');
    registries.authorities = buildAuthorityFromMarkdown(productContent);
    registries.knowledgeAreas = buildKnowledgeAreasFromMarkdown(productContent);

    this.validateNoDuplicates(registries.claims.map((c) => c.id), 'CLM-ID');
    this.validateNoDuplicates(registries.products.map((p) => p.id), 'PROD-ID');
    this.validateNoDuplicates(registries.decisions.map((d) => d.id), 'DEC-ID');

    return registries;
  }

  private async loadProducts(basePath: string): Promise<Product[]> {
    const content = await this.readFile(basePath, 'product-registry.md');
    return parseProductRegistry(content);
  }

  private async loadDecisions(basePath: string): Promise<Decision[]> {
    const content = await this.readFile(basePath, 'decision-registry.md');
    return parseDecisionRegistry(content);
  }

  private validateNoDuplicates(ids: string[], label: string): void {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        throw new RegistryError(`Duplicate ${label}: ${id}`, label);
      }
      seen.add(id);
    }
  }

  private async readFile(basePath: string, fileName: string): Promise<string> {
    const path = `${basePath}/${fileName}`;
    try {
      const fs = await import('node:fs/promises');
      return await fs.readFile(path, { encoding: 'utf-8' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new RegistryError(`Failed to read ${path}: ${message}`, path);
    }
  }

  freeze(): void {
    if (this.registries.frozen) {
      throw new FreezeViolation('RegistryLoader', 'freeze() called on already frozen registries');
    }
    this.registries.frozen = true;
  }

  getClaim(id: string): Claim | undefined {
    return this.registries.claims.find((c) => c.id === id);
  }

  getEvidence(id: string): Evidence | undefined {
    return this.registries.evidence.find((e) => e.id === id);
  }

  getProduct(id: string): Product | undefined {
    return this.registries.products.find((p) => p.id === id);
  }

  getDecision(id: string): Decision | undefined {
    return this.registries.decisions.find((d) => d.id === id);
  }

  getAuthority(id: string): Authority | undefined {
    return this.registries.authorities.find((a) => a.id === id);
  }

  getSource(id: string): Source | undefined {
    return this.registries.sources.find((s) => s.id === id);
  }

  getAllClaims(): Claim[] {
    return [...this.registries.claims];
  }

  getAllEvidence(): Evidence[] {
    return [...this.registries.evidence];
  }

  getAllProducts(): Product[] {
    return [...this.registries.products];
  }

  getAllDecisions(): Decision[] {
    return [...this.registries.decisions];
  }

  searchClaims(query: Partial<Claim>): Claim[] {
    return this.registries.claims.filter((claim) => {
      return (Object.entries(query) as [keyof Claim, unknown][]).every(([key, value]) => {
        if (value === undefined || value === null) {
          return true;
        }
        const claimValue = claim[key];
        if (Array.isArray(value) && Array.isArray(claimValue)) {
          return value.some((v) => claimValue.includes(v));
        }
        if (typeof value === 'string' && typeof claimValue === 'string') {
          return claimValue.toLowerCase().includes(value.toLowerCase());
        }
        return claimValue === value;
      });
    });
  }
}

function parseSourceType(raw: string): Source['type'] {
  const upper = raw.trim().toUpperCase() as Source['type'];
  const valid: Source['type'][] = ['CODE', 'SCHEMA', 'TEST', 'DOC', 'OPERATION', 'CONFIG', 'COMMAND'];
  for (const t of valid) {
    if (t === upper) {
      return t;
    }
  }
  return 'CODE';
}
