// Governance Engine — Execution Context Builder
// CR-01: Builds centralized, immutable, indexed context once
// All downstream modules consume context, not raw registries

import { GovernanceRegistries } from '../../types/entities';
import { ExecutionContext } from '../execution-context';
import { buildEntityIndex, buildEvidenceIndex, buildProductIndex, buildDecisionIndex, buildAuthorityIndex, buildSourceIndex } from './entity-index';
import { buildChains } from './chains';
import { buildGraph } from './graph';
import { computeMetrics } from './metrics';
import { sortIds } from './common';

export class ExecutionContextBuilder {
  static build(registries: GovernanceRegistries): ExecutionContext {
    const frozenRegistries = Object.freeze({ ...registries, frozen: true }) as GovernanceRegistries;

    const claims = buildEntityIndex(registries.claims, registries.evidence, registries.products);
    const evidence = buildEvidenceIndex(registries.evidence, registries.claims);
    const products = buildProductIndex(registries.products);
    const decisions = buildDecisionIndex(registries.decisions);
    const authorities = buildAuthorityIndex(registries.authorities);
    const sources = buildSourceIndex(registries.sources);
    const chains = buildChains(registries.claims, registries.evidence, registries.sources);
    const graph = buildGraph(registries.claims, registries.evidence, registries.products, registries.authorities);
    const metrics = computeMetrics(
      registries.claims, registries.evidence, registries.products,
      registries.decisions, registries.authorities, registries.sources, chains,
    );

    return {
      registries: frozenRegistries as Readonly<GovernanceRegistries>,
      frozen: true,
      claims, evidence, products, decisions, authorities, sources,
      chains, graph, metrics,
      sortedClaimIds: sortIds(registries.claims),
      sortedEvidenceIds: sortIds(registries.evidence),
      sortedProductIds: sortIds(registries.products),
      sortedDecisionIds: sortIds(registries.decisions),
    };
  }
}
