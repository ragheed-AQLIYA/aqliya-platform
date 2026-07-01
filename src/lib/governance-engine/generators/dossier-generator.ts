import { hashContent } from '../shared/hash';
import { isExpired } from '../shared/date';
import {
  type GovernanceRegistries,
  type Product,
  type Claim,
  type Evidence,
  type Tier,
  type LLevel,
} from '../types/entities';
import { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

const TIERS: Tier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const LLEVEL_ORDER: LLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

const DOD_REQS_MAP = new Map<LLevel, string[]>([
  ['L0', ['Concept documented']],
  ['L1', ['Marketing page exists', 'Public copy written']],
  ['L2', ['Route exists', 'Workspace scaffolded']],
  ['L3', ['UI with mock data', 'Limited persistence']],
  ['L4', ['Real workflow', 'Persistence layer', 'Basic governance', 'QA validation']],
  ['L5', ['Evidence collection', 'Review workflow', 'Approval gates', 'Exports implemented', 'Audit trail active', 'Realistic seed data']],
  ['L6', ['Security hardened', 'Monitoring active', 'Backups configured', 'Deployment automated', 'Full operational readiness']],
]);

export class DossierGenerator {
  generate(
    productId: string,
    _manifestContent: string,
    manifestHash: string,
    registries: GovernanceRegistries,
    context?: ExecutionContext,
  ): { content: string; hash: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const product = this.findProduct(productId, registries, ctx);
    const claims = this.getSortedClaims(product.id, registries, ctx);
    const evidence = this.getSortedEvidence(claims, registries, ctx);
    const content = this.buildDossierContent(
      product,
      claims,
      evidence,
      manifestHash,
      registries,
      ctx,
    );
    const hash = hashContent(content);
    return { content, hash };
  }

  private findProduct(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Product {
    const product = ctx.products.byId.get(productId) ?? registries.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`DossierGenerator: Product not found — ${productId}`);
    }
    return product;
  }

  private getSortedClaims(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Claim[] {
    return ctx.claims.byProduct.get(productId) ?? registries.claims
      .filter((c) => c.product === productId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private getSortedEvidence(claims: Claim[], registries: GovernanceRegistries, ctx: ExecutionContext): Evidence[] {
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

  private buildDossierContent(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
    manifestHash: string,
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): string {
    const segments: string[] = [];

    segments.push(this.buildHeader(product));
    segments.push(this.buildExecutiveSummary(product, claims, evidence));
    segments.push(this.buildProductIdentity(product));
    segments.push(this.buildStrategicIntent(product, registries, ctx));
    segments.push(this.buildClaimSummary(claims));
    segments.push(this.buildEvidenceSummary(evidence));
    segments.push(this.buildDoDRubric(product, claims, evidence));
    segments.push(this.buildGovernanceRecommendation(product, claims, evidence));
    segments.push(this.buildAppendices(product, claims, evidence, manifestHash, registries, ctx));

    return segments.join('\n\n') + '\n';
  }

  // ── Header ───────────────────────────────────────────────────────

  private buildHeader(product: Product): string {
    return `# DOSSIER-${product.id}`;
  }

  // ── Executive Summary ────────────────────────────────────────────

  private buildExecutiveSummary(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
  ): string {
    const lines: string[] = [];
    lines.push('## Executive Summary');
    lines.push('');

    const claimCount = claims.length;
    const evidenceCount = evidence.length;
    const claimTypes = new Set(claims.map((c) => c.type));
    const tiersPresent = new Set(evidence.map((e) => e.tier));

    const sentence1 =
      claimCount > 0
        ? `${product.id} (${product.name}) has ${claimCount} claim(s) across ${claimTypes.size} type(s), supported by ${evidenceCount} evidence record(s) across ${tiersPresent.size} tier(s).`
        : `${product.id} (${product.name}) has no registered claims.`;

    const verifiedClaims = claims.filter((c) => c.confidence === 'High').length;
    const sentence2 =
      claimCount > 0
        ? `${verifiedClaims} of ${claimCount} claim(s) carry High confidence, with an average L-Level of ${product.currentLLevel}.`
        : `The current L-Level is ${product.currentLLevel} (${product.lLevelStatus}).`;

    const evidenceScore =
      evidence.length > 0
        ? (evidence.reduce((s, e) => s + e.score, 0) / evidence.length).toFixed(2)
        : '0.00';
    const sentence3 = `Mean evidence score is ${evidenceScore} across all referenced evidence. Governance posture is consistent with ${product.strategicIntent} intent.`;

    lines.push(sentence1);
    lines.push(sentence2);
    lines.push(sentence3);

    return lines.join('\n');
  }

  // ── Product Identity ─────────────────────────────────────────────

  private buildProductIdentity(product: Product): string {
    const lines: string[] = [];
    lines.push('## Product Identity');
    lines.push('');
    lines.push('| Field | Value |');
    lines.push('|-------|-------|');
    lines.push(`| PROD-ID | ${product.id} |`);
    lines.push(`| Name | ${product.name} |`);
    lines.push(`| Name (Ar) | ${product.nameAr} |`);
    lines.push(`| Type | ${product.entityType} |`);
    lines.push(`| KA | ${product.knowledgeArea} |`);
    lines.push(`| Authority | ${product.authority} |`);
    lines.push(`| L-Level | ${product.currentLLevel} |`);
    lines.push(`| Status | ${product.lLevelStatus} |`);
    lines.push(`| Intent | ${product.strategicIntent} |`);
    lines.push(`| Evidence Status | ${product.evidenceStatus} |`);
    lines.push(`| Manifest | ${product.manifestStatus} |`);
    lines.push(`| Dossier | ${product.dossierStatus} |`);
    return lines.join('\n');
  }

  // ── Strategic Intent ─────────────────────────────────────────────

  private buildStrategicIntent(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string {
    const lines: string[] = [];
    lines.push('## Strategic Intent');
    lines.push('');
    lines.push(`**Intent:** ${product.strategicIntent}`);
    lines.push('');

    const productClaimIds = new Set(
      (ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id))
        .map((c) => c.id),
    );
    const allDecisions = [...ctx.decisions.byId.values()];
    const relatedDecisions = (allDecisions.length > 0 ? allDecisions : registries.decisions)
      .filter((d) => d.affectedClaims.some((ac) => productClaimIds.has(ac)))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (relatedDecisions.length > 0) {
      lines.push('| DEC-ID | Type | Status | Date |');
      lines.push('|--------|------|--------|------|');
      for (const d of relatedDecisions) {
        lines.push(`| ${d.id} | ${d.type} | ${d.status} | ${d.decisionDate} |`);
      }
    } else {
      lines.push('No decisions registered for this product.');
    }

    return lines.join('\n');
  }

  // ── Claim Summary ────────────────────────────────────────────────

  private buildClaimSummary(claims: Claim[]): string {
    const lines: string[] = [];
    lines.push('## Claim Summary');
    lines.push('');
    lines.push('| CLM-ID | Type | Dimension | Confidence | Status |');
    lines.push('|--------|------|-----------|------------|--------|');

    if (claims.length === 0) {
      lines.push('| — | — | — | — | — |');
    } else {
      for (const c of claims) {
        lines.push(`| ${c.id} | ${c.type} | ${c.dimension} | ${c.confidence} | ${this.formatClaimStatus(c)} |`);
      }
    }

    return lines.join('\n');
  }

  private formatClaimStatus(claim: Claim): string {
    if (claim.confidence === 'High' && claim.completeness >= 80) {
      return 'Verified';
    }
    if (claim.confidence === 'Low') {
      return 'Requires Review';
    }
    return 'Partial';
  }

  // ── Evidence Summary ─────────────────────────────────────────────

  private buildEvidenceSummary(evidence: Evidence[]): string {
    const lines: string[] = [];
    lines.push('## Evidence Summary');
    lines.push('');

    const tierMap = this.groupEvidenceByTier(evidence);

    lines.push('### Tier Scores');
    lines.push('');
    lines.push('| Tier | Count | Average Score | Strength Distribution |');
    lines.push('|------|-------|--------------|----------------------|');

    for (const tier of TIERS) {
      const evs = tierMap.get(tier) ?? [];
      const count = evs.length;
      const avgScore = count > 0
        ? (evs.reduce((s, e) => s + e.score, 0) / count).toFixed(2)
        : '0.00';

      const strong = evs.filter((e) => e.strength === 'Strong').length;
      const moderate = evs.filter((e) => e.strength === 'Moderate').length;
      const weak = evs.filter((e) => e.strength === 'Weak').length;

      const dist = `${strong}S/${moderate}M/${weak}W`;
      lines.push(`| ${tier} | ${count} | ${avgScore} | ${dist} |`);
    }

    lines.push('');
    lines.push('### Quality Distribution');
    lines.push('');

    const allQualities = evidence.map((e) => e.strength);
    const strong = allQualities.filter((q) => q === 'Strong').length;
    const moderate = allQualities.filter((q) => q === 'Moderate').length;
    const weak = allQualities.filter((q) => q === 'Weak').length;

    lines.push(`| Quality | Count | Percentage |`);
    lines.push(`|---------|-------|------------|`);
    const total = evidence.length || 1;
    lines.push(`| Strong | ${strong} | ${((strong / total) * 100).toFixed(1)}% |`);
    lines.push(`| Moderate | ${moderate} | ${((moderate / total) * 100).toFixed(1)}% |`);
    lines.push(`| Weak | ${weak} | ${((weak / total) * 100).toFixed(1)}% |`);

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

  // ── DoD Rubric ───────────────────────────────────────────────────

  private buildDoDRubric(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
  ): string {
    const lines: string[] = [];
    lines.push('## DoD Rubric');
    lines.push('');

    const currentLevelIndex = LLEVEL_ORDER.indexOf(product.currentLLevel as LLevel);
    const baseLevelIndex = Math.max(0, currentLevelIndex);

    lines.push('| Requirement | Required For | Met | Evidence |');
    lines.push('|-------------|-------------|-----|----------|');

    for (let i = 0; i <= baseLevelIndex; i++) {
      const level = this.levelAtIndex(i);
      const reqs = DOD_REQS_MAP.get(level) ?? [];
      for (const req of reqs) {
        const met = this.isRequirementMet(req, product, claims, evidence);
        const evRef = met ? this.getRequirementEvidence(req, product, claims, evidence) : '—';
        lines.push(`| ${req} | ${level} | ${met ? 'Yes' : 'No'} | ${evRef} |`);
      }
    }

    return lines.join('\n');
  }

  private isRequirementMet(
    requirement: string,
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
  ): boolean {
    const reqLower = requirement.toLowerCase();

    if (reqLower.includes('concept') || reqLower.includes('marketing') || reqLower.includes('copy')) {
      return product.evidenceStatus !== 'Not Started';
    }

    if (reqLower.includes('route') || reqLower.includes('workspace') || reqLower.includes('scaffold')) {
      return product.currentLLevel !== 'L0' && product.currentLLevel !== 'L1';
    }

    if (reqLower.includes('mock') || reqLower.includes('ui with')) {
      return claims.length > 0;
    }

    if (reqLower.includes('persistence') || reqLower.includes('real workflow')) {
      return evidence.length > 0;
    }

    if (reqLower.includes('governance') || reqLower.includes('review') || reqLower.includes('approval') || reqLower.includes('audit')) {
      return evidence.some((e) => e.tier === 'T5' || e.tier === 'T6');
    }

    if (reqLower.includes('evidence') || reqLower.includes('seed')) {
      return evidence.some((e) => e.tier === 'T1' || e.tier === 'T2');
    }

    if (reqLower.includes('export')) {
      return evidence.some((e) => e.tier === 'T6' || e.tier === 'T7');
    }

    if (reqLower.includes('security') || reqLower.includes('monitoring') || reqLower.includes('backup') || reqLower.includes('deployment') || reqLower.includes('operational')) {
      return evidence.some((e) => e.tier === 'T6' || e.tier === 'T7');
    }

    return false;
  }

  private getRequirementEvidence(
    requirement: string,
    _product: Product,
    _claims: Claim[],
    evidence: Evidence[],
  ): string {
    const reqLower = requirement.toLowerCase();

    if (reqLower.includes('governance') || reqLower.includes('review') || reqLower.includes('approval')) {
      const matches = evidence.filter((e) => e.tier === 'T5').map((e) => e.id);
      return matches.length > 0 ? matches.join(', ') : '—';
    }

    if (reqLower.includes('security') || reqLower.includes('operational') || reqLower.includes('deployment')) {
      const matches = evidence.filter((e) => e.tier === 'T6' || e.tier === 'T7').map((e) => e.id);
      return matches.length > 0 ? matches.join(', ') : '—';
    }

    const matches = evidence.map((e) => e.id);
    return matches.length > 0 ? matches.slice(0, 3).join(', ') : '—';
  }

  // ── Governance Recommendation ────────────────────────────────────

  private buildGovernanceRecommendation(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
  ): string {
    const lines: string[] = [];
    lines.push('## Governance Recommendation');
    lines.push('');

    const currentLevelIndex = LLEVEL_ORDER.indexOf(product.currentLLevel as LLevel);
    const intent = product.strategicIntent;

    if (intent === 'Frozen') {
      lines.push('**Status:** Product is frozen. Maintain current evidence base. No new L-level decisions required.');
      lines.push('');
      lines.push('**Action:** Run evidence freshness validation regularly. Archive superseded evidence.');
      return lines.join('\n');
    }

    if (intent === 'Deferred') {
      lines.push('**Status:** Product development is deferred. Preserve existing evidence. No active promotion required.');
      lines.push('');
      lines.push('**Action:** Review deferred products quarterly. Refresh expiring evidence to prevent governance gaps.');
      return lines.join('\n');
    }

    if (evidence.length === 0) {
      lines.push('**Status:** Insufficient evidence for governance recommendation.');
      lines.push('');
      lines.push('**Action:** Register at least one evidence record before proceeding with review.');
      return lines.join('\n');
    }

    const targetLevel = this.computeTargetLevel(currentLevelIndex, claims, evidence);
    const gaps = this.identifyGaps(currentLevelIndex, targetLevel, evidence);

    const validClaims = claims.filter((c) => c.evidenceRefs.length > 0).length;
    const totalClaims = claims.length;

    lines.push(`**Current L-Level:** ${product.currentLLevel}`);
    const recLevel = this.levelAtIndex(targetLevel);
    lines.push(`**Recommended Target:** ${recLevel}`);
    lines.push(`**Confidence:** ${this.computeRecommendationConfidence(claims, evidence)}`);
    lines.push('');

    if (gaps.length === 0) {
      lines.push('**Assessment:** No critical gaps identified. Evidence posture is consistent with target level.');
    } else {
      lines.push('**Identified Gaps:**');
      for (const gap of gaps) {
        lines.push(`- ${gap}`);
      }
    }

    lines.push('');
    lines.push(`**Claim Coverage:** ${validClaims}/${totalClaims} claims have evidence.`);
    lines.push(`**Evidence Base:** ${evidence.length} records across ${this.countTiers(evidence)} tiers.`);

    const expiredCount = evidence.filter((e) => isExpired(e.freshness.expires)).length;
    if (expiredCount > 0) {
      lines.push(`**⚠ Expired Evidence:** ${expiredCount} record(s) require refresh.`);
    }

    lines.push('');
    lines.push('**Recommendation:**');
    if (gaps.length > 0) {
      lines.push('1. Address identified gaps before pursuing higher L-level.');
      lines.push('2. Refresh expired or expiring evidence.');
      lines.push('3. Conduct peer review of current evidence claims.');
    } else {
      lines.push('1. Continue monitoring evidence freshness.');
      lines.push('2. Maintain current evidence quality standards.');
      lines.push('3. Consider promotion review if strategic intent supports advancement.');
    }

    return lines.join('\n');
  }

  private computeTargetLevel(
    currentIndex: number,
    claims: Claim[],
    evidence: Evidence[],
  ): number {
    if (evidence.length === 0) {
      return 0;
    }

    const tierCount = this.countTiers(evidence);
    const avgScore =
      evidence.reduce((s, e) => s + e.score, 0) / evidence.length;
    const highConfidenceClaims = claims.filter((c) => c.confidence === 'High').length;

    let target = currentIndex;

    if (tierCount >= 2 && avgScore >= 1.5) {
      target = Math.max(target, 3);
    }
    if (tierCount >= 4 && avgScore >= 2.0 && highConfidenceClaims >= 1) {
      target = Math.max(target, 4);
    }
    if (tierCount >= 5 && avgScore >= 2.5 && highConfidenceClaims >= 3) {
      target = Math.max(target, 5);
    }
    if (tierCount >= 6 && avgScore >= 2.8 && highConfidenceClaims >= 5) {
      target = Math.max(target, 6);
    }

    return target;
  }

  private identifyGaps(
    currentIndex: number,
    targetIndex: number,
    evidence: Evidence[],
  ): string[] {
    const gaps: string[] = [];

    if (targetIndex >= 3) {
      const t1 = evidence.filter((e) => e.tier === 'T1');
      const t2 = evidence.filter((e) => e.tier === 'T2');
      if (t1.length === 0) {
        gaps.push('Missing T1 (existence) evidence');
      }
      if (t2.length === 0) {
        gaps.push('Missing T2 (implementation) evidence');
      }
    }

    if (targetIndex >= 4) {
      const t3 = evidence.filter((e) => e.tier === 'T3');
      const t4 = evidence.filter((e) => e.tier === 'T4');
      if (t3.length === 0) {
        gaps.push('Missing T3 (integration) evidence');
      }
      if (t4.length === 0) {
        gaps.push('Missing T4 (testing) evidence');
      }
    }

    if (targetIndex >= 5) {
      const t5 = evidence.filter((e) => e.tier === 'T5');
      const t6 = evidence.filter((e) => e.tier === 'T6');
      if (t5.length === 0) {
        gaps.push('Missing T5 (governance) evidence');
      }
      if (t6.length === 0) {
        gaps.push('Missing T6 (operational) evidence');
      }
    }

    if (targetIndex >= 6) {
      const t7 = evidence.filter((e) => e.tier === 'T7');
      if (t7.length === 0) {
        gaps.push('Missing T7 (production) evidence');
      }
    }

    return gaps;
  }

  private computeRecommendationConfidence(
    claims: Claim[],
    evidence: Evidence[],
  ): 'High' | 'Medium' | 'Low' {
    if (claims.length === 0 || evidence.length === 0) {
      return 'Low';
    }
    const highClaims = claims.filter((c) => c.confidence === 'High').length;
    const strongEvidence = evidence.filter((e) => e.strength === 'Strong').length;

    const claimRatio = highClaims / claims.length;
    const evRatio = strongEvidence / evidence.length;

    if (claimRatio >= 0.6 && evRatio >= 0.5) {
      return 'High';
    }
    if (claimRatio >= 0.3 && evRatio >= 0.2) {
      return 'Medium';
    }
    return 'Low';
  }

  // ── Appendices ───────────────────────────────────────────────────

  private buildAppendices(
    product: Product,
    _claims: Claim[],
    evidence: Evidence[],
    manifestHash: string,
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): string {
    const segments: string[] = [];
    segments.push('## Appendices');
    segments.push('');

    // Appendix A: Manifest Hash
    segments.push('### A. Manifest Hash');
    segments.push('');
    segments.push(`\`\`\`\n${manifestHash}\n\`\`\``);

    // Appendix B: Evidence Map
    segments.push('### B. Evidence Map');
    segments.push('');
    segments.push('| EV-ID | Tier | Strength | Source |');
    segments.push('|-------|------|----------|--------|');
    if (evidence.length === 0) {
      segments.push('| — | — | — | — |');
    } else {
      for (const ev of evidence) {
        segments.push(`| ${ev.id} | ${ev.tier} | ${ev.strength} | ${ev.sourceRef} |`);
      }
    }

    // Appendix C: Freshness
    segments.push('### C. Freshness');
    segments.push('');
    segments.push('| EV-ID | Evidence Date | Expires | Status |');
    segments.push('|-------|--------------|---------|--------|');
    if (evidence.length === 0) {
      segments.push('| — | — | — | — |');
    } else {
      for (const ev of evidence) {
        const expired = isExpired(ev.freshness.expires);
        const status = expired ? 'Expired' : 'Active';
        segments.push(`| ${ev.id} | ${ev.freshness.evidenceDate} | ${ev.freshness.expires} | ${status} |`);
      }
    }

    // Appendix D: Decision History
    segments.push('### D. Decision History');
    segments.push('');
    const productClaimIds = new Set(
      (ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id))
        .map((c) => c.id),
    );
    const allDecisions = [...ctx.decisions.byId.values()];
    const productDecisions = (allDecisions.length > 0 ? allDecisions : registries.decisions)
      .filter((d) => d.affectedClaims.some((ac) => productClaimIds.has(ac)))
      .sort((a, b) => a.id.localeCompare(b.id));

    segments.push('| DEC-ID | Type | Status | Date |');
    segments.push('|--------|------|--------|------|');
    if (productDecisions.length === 0) {
      segments.push('| — | — | — | — |');
    } else {
      for (const d of productDecisions) {
        segments.push(`| ${d.id} | ${d.type} | ${d.status} | ${d.decisionDate} |`);
      }
    }

    return segments.join('\n');
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private levelAtIndex(index: number): LLevel {
    const slice = LLEVEL_ORDER.slice(index, index + 1);
    if (slice.length === 1) {
      return slice[0];
    }
    return 'L0';
  }

  private countTiers(evidence: Evidence[]): number {
    const tiers = new Set(evidence.map((e) => e.tier));
    return tiers.size;
  }
}
