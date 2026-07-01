import type { GovernanceRegistries, Authority, Product } from '../types/entities';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

export class AuthoritiesValidator {
  private registries: GovernanceRegistries;
  private context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
  }

  private get productList(): Product[] {
    return this.context ? Array.from(this.context.products.byId.values()) : this.registries.products;
  }

  private get productCount(): number {
    return this.context ? this.context.products.byId.size : this.registries.products.length;
  }

  private get authorityList(): Authority[] {
    return this.context ? Array.from(this.context.authorities.byId.values()) : this.registries.authorities;
  }

  private get authorityCount(): number {
    return this.context ? this.context.authorities.byId.size : this.registries.authorities.length;
  }

  validate(): ValidationResponse {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    const products = this.productList;
    const productTotal = this.productCount;
    const authorities = this.authorityList;
    const authTotal = this.authorityCount;

    results.push(this.validateProductAuthorityCoverage(products, productTotal));
    results.push(this.validateNoDuplicateKA(authorities, authTotal));
    results.push(this.validateChainIntegrity(authorities, authTotal));

    const passed = results.filter((r) => r.status === 'pass').length;
    const failed = results.filter((r) => r.status === 'fail').length;
    const warnings = results.filter((r) => r.status === 'warn').length;

    return {
      status: failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
      summary: { total: results.length, passed, failed, warnings },
      results,
      metadata: {
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        engineVersion: 'M2 v1.2',
        baselineVersion: 'M2 v1.2',
      },
    };
  }

  private validateProductAuthorityCoverage(products: Product[], total: number): ValidationResult {
    const uncovered: Product[] = [];
    const ctx = this.context;
    const knownAuthIds = ctx
      ? ctx.authorities.byId
      : new Map(this.registries.authorities.map((a) => [a.id, a]));

    for (const product of products) {
      if (!product.authority) {
        uncovered.push(product);
        continue;
      }
      if (!knownAuthIds.has(product.authority)) {
        uncovered.push(product);
      }
    }

    const findings = uncovered.map(
      (p) => `Product ${p.id}: missing or unresolvable authority "${p.authority ?? '(none)'}"`,
    );

    return {
      id: 'AUTH-PRODUCT-COVERAGE',
      name: 'Product Authority Coverage',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'critical',
      details: `Checked ${total} products; ${findings.length} lack a valid authority`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Assign each product an existing AUTH-* from the authorities registry'
          : undefined,
    };
  }

  private validateNoDuplicateKA(authorities: Authority[], total: number): ValidationResult {
    const kaToAuthorities = new Map<string, Authority[]>();

    for (const auth of authorities) {
      const existing = kaToAuthorities.get(auth.knowledgeArea) ?? [];
      existing.push(auth);
      kaToAuthorities.set(auth.knowledgeArea, existing);
    }

    const findings: string[] = [];
    for (const [ka, authList] of kaToAuthorities) {
      if (authList.length > 1) {
        const ids = authList.map((a) => a.id).join(', ');
        findings.push(`KnowledgeArea ${ka} has ${authList.length} authorities: ${ids} (expected ≤1)`);
      }
    }

    return {
      id: 'AUTH-NO-DUPLICATE-KA',
      name: 'Duplicate Authority Check by KnowledgeArea',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Checked ${total} authorities across ${kaToAuthorities.size} knowledge areas; ${findings.length} conflicts`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Consolidate authorities so each KnowledgeArea has at most one owning authority'
          : undefined,
    };
  }

  private validateChainIntegrity(authorities: Authority[], total: number): ValidationResult {
    const findings: string[] = [];
    const ctx = this.context;
    const authMap = ctx
      ? ctx.authorities.byId
      : new Map(this.registries.authorities.map((a) => [a.id, a]));

    for (const auth of authorities) {
      if (auth.supersedes && !authMap.has(auth.supersedes)) {
        findings.push(
          `Authority ${auth.id} supersedes "${auth.supersedes}" which does not exist in the registry`,
        );
      }

      if (auth.supersededBy && !authMap.has(auth.supersededBy)) {
        findings.push(
          `Authority ${auth.id} is supersededBy "${auth.supersededBy}" which does not exist in the registry`,
        );
      }

      if (auth.supersedes && auth.supersededBy) {
        findings.push(
          `Authority ${auth.id} has both supersedes and supersededBy — ambiguous chain position`,
        );
      }

      if (auth.supersedes || auth.supersededBy) {
        const supersedesAuth = auth.supersedes ? authMap.get(auth.supersedes) : undefined;
        const supersededByAuth = auth.supersededBy ? authMap.get(auth.supersededBy) : undefined;

        if (supersedesAuth && supersedesAuth.chainPosition >= auth.chainPosition) {
          findings.push(
            `Authority ${auth.id} (pos ${auth.chainPosition}) supersedes ${supersedesAuth.id} (pos ${supersedesAuth.chainPosition}) — chain order violation`,
          );
        }

        if (supersededByAuth && supersededByAuth.chainPosition <= auth.chainPosition) {
          findings.push(
            `Authority ${auth.id} (pos ${auth.chainPosition}) supersededBy ${supersededByAuth.id} (pos ${supersededByAuth.chainPosition}) — chain order violation`,
          );
        }
      }
    }

    return {
      id: 'AUTH-CHAIN-INTEGRITY',
      name: 'Authority Chain Integrity',
      status: findings.length === 0 ? 'pass' : 'warn',
      severity: 'high',
      details: `Verified ${total} authorities; ${findings.length} chain integrity issues`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Repair supersedes/supersededBy references and ensure chain positions form a complete sequence'
          : undefined,
    };
  }
}
