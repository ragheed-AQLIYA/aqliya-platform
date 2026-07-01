import { hashContent } from '../shared/hash';
import {
  type GovernanceRegistries,
  type Claim,
  type Evidence,
  type Product,
  type Tier,
} from '../types/entities';
import { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

const TIERS: Tier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const TIER_EXPECTED: [Tier, string][] = [
  ['T1', 'Product existence and identity'],
  ['T2', 'Core implementation evidence'],
  ['T3', 'Integration and interface evidence'],
  ['T4', 'Test and validation evidence'],
  ['T5', 'Review and governance evidence'],
  ['T6', 'Operational and deployment evidence'],
  ['T7', 'Pilot and production evidence'],
];

const TIER_DESCRIPTION_MAP = new Map<Tier, string>(TIER_EXPECTED);

interface IntegrityScores {
  claimCoverage: number;
  evidenceCoverage: number;
  authorityCoverage: number;
  sourceCoverage: number;
  freshness: number;
  provenance: number;
}

export class ManifestGenerator {
  generate(
    productId: string,
    registries: GovernanceRegistries,
    context?: ExecutionContext,
  ): { content: string; hash: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const product = this.findProduct(productId, registries, ctx);
    const claims = this.getProductClaims(product.id, registries, ctx);
    const evidence = this.getProductEvidence(claims, registries, ctx);
    const content = this.buildManifestContent(product, claims, evidence, registries, ctx);
    const hash = hashContent(content);
    return { content, hash };
  }

  private findProduct(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Product {
    const product = ctx.products.byId.get(productId) ?? registries.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`ManifestGenerator: Product not found — ${productId}`);
    }
    return product;
  }

  private getProductClaims(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Claim[] {
    return ctx.claims.byProduct.get(productId) ?? registries.claims
      .filter((c) => c.product === productId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private getProductEvidence(claims: Claim[], registries: GovernanceRegistries, ctx: ExecutionContext): Evidence[] {
    const evIds = new Set<string>();
    for (const claim of claims) {
      for (const ref of claim.evidenceRefs) {
        evIds.add(ref);
      }
    }
    if (ctx.evidence.byId.size >= registries.evidence.length) {
      const result: Evidence[] = [];
      for (const id of evIds) {
        const ev = ctx.evidence.byId.get(id);
        if (ev) result.push(ev);
      }
      return result.sort((a, b) => a.id.localeCompare(b.id));
    }
    return registries.evidence
      .filter((ev) => evIds.has(ev.id))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private buildManifestContent(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): string {
    const segments: string[] = [];

    segments.push(this.buildProductIdentity(product));
    segments.push(this.buildClaimsTable(claims));
    segments.push(this.buildEvidenceCoverageTable(evidence));

    const scores = this.computeIntegrityScores(product, claims, evidence, registries, ctx);
    segments.push(this.buildIntegrityScoreSection(scores));

    segments.push(this.buildDependencyGraph(product, registries, ctx));
    segments.push(this.buildFreshnessSection(evidence));

    return segments.join('\n\n') + '\n';
  }

  // ── Product Identity ──────────────────────────────────────────────

  private buildProductIdentity(product: Product): string {
    const lines: string[] = [];
    lines.push(`# MANIFEST-${product.id}`);
    lines.push('');
    lines.push('## Product Identity');
    lines.push('');
    lines.push('| Field | Value |');
    lines.push('|-------|-------|');
    lines.push(`| PROD-ID | ${product.id} |`);
    lines.push(`| Name | ${product.name} |`);
    lines.push(`| Type | ${product.entityType} |`);
    lines.push(`| KA | ${product.knowledgeArea} |`);
    lines.push(`| Authority | ${product.authority} |`);
    lines.push(`| L-Level | ${product.currentLLevel} (${product.lLevelStatus}) |`);
    lines.push(`| Intent | ${product.strategicIntent} |`);
    return lines.join('\n');
  }

  // ── Claims Table ─────────────────────────────────────────────────

  private buildClaimsTable(claims: Claim[]): string {
    const lines: string[] = [];
    lines.push('## Aggregated Claims');
    lines.push('');
    lines.push('| CLM-ID | Type | Dimension | Confidence | Evidence Refs |');
    lines.push('|--------|------|-----------|------------|---------------|');

    if (claims.length === 0) {
      lines.push('| — | — | — | — | — |');
    } else {
      for (const c of claims) {
        const refs = c.evidenceRefs.length > 0 ? c.evidenceRefs.join(', ') : '—';
        lines.push(`| ${c.id} | ${c.type} | ${c.dimension} | ${c.confidence} | ${refs} |`);
      }
    }

    return lines.join('\n');
  }

  // ── Evidence Coverage Table ──────────────────────────────────────

  private buildEvidenceCoverageTable(evidence: Evidence[]): string {
    const lines: string[] = [];
    lines.push('## Evidence Coverage');
    lines.push('');
    lines.push('| Tier | Description | Evidence IDs | Score |');
    lines.push('|------|-------------|-------------|-------|');

    const tierMap = this.groupEvidenceByTier(evidence);

    for (const tier of TIERS) {
      const evs = tierMap.get(tier) ?? [];
      const ids = evs.map((e) => e.id).sort();
      const avgScore = evs.length > 0
        ? evs.reduce((sum, e) => sum + e.score, 0) / evs.length
        : 0;
      const formattedScore = avgScore.toFixed(2);
      const idStr = ids.length > 0 ? ids.join(', ') : '—';
      lines.push(`| ${tier} | ${TIER_DESCRIPTION_MAP.get(tier) ?? ''} | ${idStr} | ${formattedScore} |`);
    }

    return lines.join('\n');
  }

  private groupEvidenceByTier(evidence: Evidence[]): Map<Tier, Evidence[]> {
    const map = new Map<Tier, Evidence[]>();
    for (const tier of TIERS) {
      map.set(tier, []);
    }
    for (const ev of evidence) {
      const group = map.get(ev.tier);
      if (group) {
        group.push(ev);
      }
    }
    return map;
  }

  // ── Integrity Scores ─────────────────────────────────────────────

  private computeIntegrityScores(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): IntegrityScores {
    const claimCoverage = this.computeClaimCoverage(claims);
    const evidenceCoverage = this.computeEvidenceCoverage(evidence);
    const authorityCoverage = this.computeAuthorityCoverage(product, registries, ctx);
    const sourceCoverage = this.computeSourceCoverage(evidence, registries, ctx);
    const freshness = this.computeFreshnessScore(evidence);
    const provenance = this.computeProvenanceScore(claims, evidence, registries, ctx);

    return { claimCoverage, evidenceCoverage, authorityCoverage, sourceCoverage, freshness, provenance };
  }

  private computeClaimCoverage(claims: Claim[]): number {
    if (claims.length === 0) {
      return 0;
    }
    const withEvidence = claims.filter((c) => c.evidenceRefs.length > 0).length;
    return withEvidence / claims.length;
  }

  private computeEvidenceCoverage(evidence: Evidence[]): number {
    const tierMap = this.groupEvidenceByTier(evidence);
    let populatedTiers = 0;
    for (const tier of TIERS) {
      const evs = tierMap.get(tier);
      if (evs && evs.length > 0) {
        populatedTiers++;
      }
    }
    return populatedTiers / TIERS.length;
  }

  private computeAuthorityCoverage(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): number {
    const productClaims = ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id);
    if (productClaims.length === 0) {
      return 0;
    }
    const authIds = new Set<string>();
    for (const c of productClaims) {
      for (const a of c.authorities) {
        authIds.add(a);
      }
    }
    let found = 0;
    for (const authId of authIds) {
      if (ctx.authorities.byId.has(authId) || registries.authorities.some((a) => a.id === authId)) {
        found++;
      }
    }
    return authIds.size > 0 ? found / authIds.size : 0;
  }

  private computeSourceCoverage(evidence: Evidence[], registries: GovernanceRegistries, ctx: ExecutionContext): number {
    if (evidence.length === 0) {
      return 0;
    }
    const validSource = evidence.filter((ev) =>
      ctx.sources.byId.has(ev.sourceRef) || registries.sources.some((s) => s.id === ev.sourceRef),
    ).length;
    return validSource / evidence.length;
  }

  private computeFreshnessScore(evidence: Evidence[]): number {
    if (evidence.length === 0) {
      return 0;
    }
    let freshCount = 0;
    for (const ev of evidence) {
      const fresh = this.isEvidenceFresh(ev);
      if (fresh) {
        freshCount++;
      }
    }
    return freshCount / evidence.length;
  }

  private isEvidenceFresh(evidence: Evidence): boolean {
    if (!evidence.freshness?.expires) {
      return false;
    }
    const expiry = new Date(evidence.freshness.expires);
    const now = new Date();
    return now < expiry;
  }

  private computeProvenanceScore(
    claims: Claim[],
    evidence: Evidence[],
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): number {
    if (claims.length === 0 || evidence.length === 0) {
      return 0;
    }
    const sourceIds = new Set(evidence.map((ev) => ev.sourceRef));
    let withDeepChain = 0;
    for (const srcId of sourceIds) {
      const source = ctx.sources.byId.get(srcId) ?? registries.sources.find((s) => s.id === srcId);
      if (source && source.containedIn.length > 0) {
        withDeepChain++;
      }
    }
    return sourceIds.size > 0 ? withDeepChain / sourceIds.size : 0;
  }

  private buildIntegrityScoreSection(scores: IntegrityScores): string {
    const lines: string[] = [];
    lines.push('## Integrity Score');
    lines.push('');
    lines.push('| Dimension | Score |');
    lines.push('|-----------|-------|');
    lines.push(`| Claim Coverage | ${scores.claimCoverage.toFixed(2)} |`);
    lines.push(`| Evidence Coverage | ${scores.evidenceCoverage.toFixed(2)} |`);
    lines.push(`| Authority Coverage | ${scores.authorityCoverage.toFixed(2)} |`);
    lines.push(`| Source Coverage | ${scores.sourceCoverage.toFixed(2)} |`);
    lines.push(`| Freshness | ${scores.freshness.toFixed(2)} |`);
    lines.push(`| Provenance | ${scores.provenance.toFixed(2)} |`);

    const average =
      (scores.claimCoverage +
        scores.evidenceCoverage +
        scores.authorityCoverage +
        scores.sourceCoverage +
        scores.freshness +
        scores.provenance) /
      6;

    lines.push('');
    lines.push(`**Overall Integrity:** ${average.toFixed(2)}`);

    const quality =
      average >= 0.8
        ? 'Strong'
        : average >= 0.5
          ? 'Moderate'
          : 'Weak';
    lines.push(`**Quality Classification:** ${quality}`);

    return lines.join('\n');
  }

  // ── Dependency Graph ─────────────────────────────────────────────

  private buildDependencyGraph(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string {
    const lines: string[] = [];
    lines.push('## Dependency Graph');
    lines.push('');

    const treeLines = this.buildTree(product, registries, ctx);
    lines.push(...treeLines);

    return lines.join('\n');
  }

  private buildTree(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string[] {
    const result: string[] = [];

    result.push(product.id);

    const allProducts = [...ctx.products.byId.values()];
    const parentLines: string[] = [];
    if (product.parentSystem) {
      const parent = ctx.products.byId.get(product.parentSystem) ?? registries.products.find((p) => p.id === product.parentSystem);
      if (parent) {
        parentLines.push(`└── Parent: ${parent.id}`);
        const siblings = allProducts
          .filter((p) => p.parentSystem === product.parentSystem && p.id !== product.id)
          .sort((a, b) => a.id.localeCompare(b.id));
        for (const sibling of siblings) {
          parentLines.push(`    ├── Sibling: ${sibling.id}`);
        }
      }
    }

    const children = allProducts
      .filter((p) => p.parentSystem === product.id)
      .sort((a, b) => a.id.localeCompare(b.id));
    for (const child of children) {
      parentLines.push(`├── Child: ${child.id}`);
    }

    const ka = registries.knowledgeAreas.find((k) => k.id === product.knowledgeArea);
    if (ka) {
      parentLines.push(`└── KA: ${ka.id} (${ka.name})`);
    }

    if (parentLines.length > 0) {
      result.push(parentLines.join('\n'));
    }

    return result;
  }

  // ── Freshness Section ────────────────────────────────────────────

  private buildFreshnessSection(evidence: Evidence[]): string {
    const lines: string[] = [];
    lines.push('## Freshness');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');

    const dates = evidence
      .map((ev) => ev.freshness?.evidenceDate)
      .filter((d): d is string => !!d)
      .sort();

    if (dates.length > 0) {
      lines.push(`| Earliest Evidence | ${dates[0]} |`);
      lines.push(`| Latest Evidence | ${dates[dates.length - 1]} |`);
    } else {
      lines.push('| Earliest Evidence | — |');
      lines.push('| Latest Evidence | — |');
    }

    const now = new Date();
    let expiredCount = 0;
    let expiringCount = 0;
    for (const ev of evidence) {
      if (ev.freshness?.expires) {
        const expiry = new Date(ev.freshness.expires);
        if (now >= expiry) {
          expiredCount++;
        } else {
          const diff = expiry.getTime() - now.getTime();
          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          if (daysLeft <= 30) {
            expiringCount++;
          }
        }
      }
    }

    lines.push(`| Expired Evidence | ${expiredCount} |`);
    lines.push(`| Expiring (≤30d) | ${expiringCount} |`);
    lines.push(`| Total Evidence | ${evidence.length} |`);

    lines.push('');
    lines.push(`**Generated:** ${this.formatDateForContent(now)}`);

    return lines.join('\n');
  }

  private formatDateForContent(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
