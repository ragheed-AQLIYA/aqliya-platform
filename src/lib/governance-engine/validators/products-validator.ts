import type { GovernanceRegistries, Product, EntityType } from '../types/entities';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

const VALID_ENTITY_TYPES: readonly EntityType[] = [
  'Platform',
  'Product',
  'Workspace',
  'Engine',
  'Foundation',
  'Runtime',
  'Service',
  'Library',
];

const STATUS_TARGETS: Record<string, string> = {
  manifestStatus: 'Generated',
  dossierStatus: 'Generated',
};

export class ProductsValidator {
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

  validate(): ValidationResponse {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    const products = this.productList;
    const total = this.productCount;

    results.push(this.validateKAAssignment(products, total));
    results.push(this.validateAuthorityAssignment(products, total));
    results.push(this.validateEntityType(products, total));
    results.push(this.validateManifestDossierStatus(products, total));

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

  private validateKAAssignment(products: Product[], total: number): ValidationResult {
    const missingKA: Product[] = [];
    const unknownKA: Product[] = [];
    const knownKAs = new Set(this.registries.knowledgeAreas.map((ka) => ka.id));

    for (const product of products) {
      if (!product.knowledgeArea) {
        missingKA.push(product);
      } else if (!knownKAs.has(product.knowledgeArea)) {
        unknownKA.push(product);
      }
    }

    const findings: string[] = [];
    for (const p of missingKA) {
      findings.push(`Product ${p.id} has no knowledgeArea assigned`);
    }
    for (const p of unknownKA) {
      findings.push(`Product ${p.id} references unknown knowledgeArea "${p.knowledgeArea}"`);
    }

    return {
      id: 'PROD-KA',
      name: 'Product KnowledgeArea Assignment',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Checked ${total} products; ${missingKA.length} missing KA, ${unknownKA.length} unknown KA`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Ensure every product has a valid knowledgeArea matching an entry in the knowledgeAreas registry'
          : undefined,
    };
  }

  private validateAuthorityAssignment(products: Product[], total: number): ValidationResult {
    const missingAuth: Product[] = [];
    const unknownAuth: Product[] = [];
    const ctx = this.context;
    const knownAuths = ctx
      ? ctx.authorities.byId
      : new Map(this.registries.authorities.map((a) => [a.id, a]));

    for (const product of products) {
      if (!product.authority) {
        missingAuth.push(product);
      } else if (!knownAuths.has(product.authority)) {
        unknownAuth.push(product);
      }
    }

    const findings: string[] = [];
    for (const p of missingAuth) {
      findings.push(`Product ${p.id} has no authority assigned`);
    }
    for (const p of unknownAuth) {
      findings.push(`Product ${p.id} references unknown authority "${p.authority}"`);
    }

    return {
      id: 'PROD-AUTH',
      name: 'Product Authority Assignment',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'critical',
      details: `Checked ${total} products; ${missingAuth.length} missing authority, ${unknownAuth.length} unknown authority reference`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Assign a valid authority (AUTH-*) from the authorities registry to each product'
          : undefined,
    };
  }

  private validateEntityType(products: Product[], total: number): ValidationResult {
    const entitySet = new Set<EntityType>(VALID_ENTITY_TYPES);
    const invalidTypes: Product[] = [];

    for (const product of products) {
      if (!entitySet.has(product.entityType as EntityType)) {
        invalidTypes.push(product);
      }
    }

    const findings = invalidTypes.map(
      (p) => `Product ${p.id}: unrecognized entityType "${p.entityType}"`,
    );

    return {
      id: 'PROD-ENTITY-TYPE',
      name: 'Product Entity Type Classification',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Classified ${total} products; ${findings.length} with unrecognized entityType`,
      findings,
      suggestedFix:
        findings.length > 0
          ? `Use a valid entityType: ${VALID_ENTITY_TYPES.join(', ')}`
          : undefined,
    };
  }

  private validateManifestDossierStatus(products: Product[], total: number): ValidationResult {
    const missingManifest: Product[] = [];
    const missingDossier: Product[] = [];

    for (const product of products) {
      if (product.manifestStatus !== 'Generated') {
        missingManifest.push(product);
      }
      if (product.dossierStatus !== 'Generated') {
        missingDossier.push(product);
      }
    }

    const findings: string[] = [];
    for (const p of missingManifest) {
      findings.push(`Product ${p.id}: manifestStatus="${p.manifestStatus}" (expected "Generated")`);
    }
    for (const p of missingDossier) {
      findings.push(`Product ${p.id}: dossierStatus="${p.dossierStatus}" (expected "Generated")`);
    }

    return {
      id: 'PROD-MANIFEST-DOSSIER',
      name: 'Product Manifest and Dossier Status',
      status: findings.length === 0 ? 'pass' : 'warn',
      severity: 'medium',
      details: `Checked ${total} products; ${missingManifest.length} without Generated manifest, ${missingDossier.length} without Generated dossier`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Generate manifests and dossiers for products missing them'
          : undefined,
    };
  }
}
