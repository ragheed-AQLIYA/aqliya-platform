// DEC-2026-0030: Pipeline Orchestration Separation
// DEC-2026-0032: Pipeline Provenance
// DEC-2026-0033: Pipeline Stage Contract
//
// Canonical Orchestrator for all ENG-001 stages.
//
// This is the ONLY module that orchestrates engines.
// Individual engines NEVER call other engines directly.
//
// Responsibilities:
//   - Sequence: Extractor → Validator → Statistics → Readiness → Suitability → Decision
//   - Error containment: no exceptions between stages
//   - Skip propagation: failed stage → subsequent stages SKIPPED
//   - Provenance: every stage records timing, version, evidence
//   - Events: domain events for observability
//
// Non-responsibilities:
//   - No business logic
//   - No interpretation of results
//   - No recommendations
//   - No technology suggestions
//   - No technology or product recommendations (Suitability produces architectural fit only;
//     ENG-001F Decision Framework handles recommendations, NOT decisions)

import { RegistryExtractor } from '../extractor';
import type { ExtractedRegistries } from '../types/extracted-registries';
import { computeStatistics, type GraphStatistics } from '../statistics';
import type { ValidationSummary } from '../validation/types/validation-issues';
import { aggregateValidations } from '../validation/aggregator';
import { computeReadiness, type ReadinessResult } from '../readiness';
import { computeSuitability, type SuitabilityResult } from '../suitability';
import { produceRecommendation, type DecisionRecommendation } from '../decision-framework';

import { PipelineStage, StageOutcome, type PipelineStageResult, type PipelineResult, type PipelineOptions } from './pipeline-types';
import { PipelineEventEmitter } from './pipeline-events';
import {
  buildSuccessResult,
  buildFailedResult,
  buildSkippedResult,
  buildProvenance,
  buildPipelineResult,
  generateRunId,
} from './pipeline-result';

// ---------------------------------------------------------------------------
// Adapter: Extractor
// ---------------------------------------------------------------------------

/**
 * Validate that ExtractedRegistries has at least some entities.
 * Returns ValidationSummary-compatible shape or null if valid.
 */
function extractorIsValid(registries: ExtractedRegistries): string | null {
  const total =
    registries.metadata.entityCounts.claims +
    registries.metadata.entityCounts.products +
    registries.metadata.entityCounts.decisions +
    registries.metadata.entityCounts.evidence +
    registries.metadata.entityCounts.authorities;

  if (total === 0) {
    return 'Extractor produced zero entities — empty registries detected';
  }

  return null;
}

// ---------------------------------------------------------------------------
// Current engine versions
// ---------------------------------------------------------------------------

const ENGINE_VERSIONS: Record<PipelineStage, string> = {
  [PipelineStage.EXTRACTOR]: '1.0',
  [PipelineStage.VALIDATOR]: '1.0',
  [PipelineStage.STATISTICS]: '1.0',
  [PipelineStage.READINESS]: '1.0',
  [PipelineStage.SUITABILITY]: '1.0',
  [PipelineStage.DECISION]: '1.0',
};

// ---------------------------------------------------------------------------
// Pipeline Orchestrator
// ---------------------------------------------------------------------------

/**
 * ENG-001 Pipeline Orchestrator.
 *
 * Usage:
 *   const pipeline = new GraphReadinessPipeline(projectRoot);
 *   const result = await pipeline.run();
 *   console.log(result.provenance.stages);
 */
export class GraphReadinessPipeline {
  private projectRoot: string;
  private events: PipelineEventEmitter;

  constructor(projectRoot: string, events?: PipelineEventEmitter) {
    this.projectRoot = projectRoot;
    this.events = events ?? new PipelineEventEmitter();
  }

  /** Access the event emitter (for subscribing to events) */
  get events$(): PipelineEventEmitter {
    return this.events;
  }

  /**
   * Run the full ENG-001 pipeline:
   *   Extractor → Validator → Statistics → Readiness → Suitability → Decision
   *
   * Each stage catches its own errors and returns a PipelineStageResult.
   * If a stage FAILS, subsequent stages are SKIPPED.
   * No exceptions propagate between stages.
   */
  async run(options?: PipelineOptions): Promise<PipelineResult> {
    const runId = options?.runId ?? generateRunId();
    const pipelineVersion = options?.pipelineVersion ?? '1.0';
    const startedAt = new Date().toISOString();
    const stageResults: PipelineStageResult<unknown>[] = [];

    // Emit pipeline started
    this.events.emit({
      type: 'PipelineStarted',
      runId,
      pipelineVersion,
      startedAt,
    });

    // -----------------------------------------------------------------------
    // Stage 1: Extractor
    // -----------------------------------------------------------------------
    const extractorResult = await this.runStage(
      PipelineStage.EXTRACTOR,
      runId,
      () => this.executeExtractor(),
    );
    stageResults.push(extractorResult);

    // -----------------------------------------------------------------------
    // Stage 2: Validator
    // -----------------------------------------------------------------------
    const validatorResult = await this.runDependentStage(
      PipelineStage.VALIDATOR,
      runId,
      extractorResult,
      () => this.executeValidator(extractorResult.output),
    );
    stageResults.push(validatorResult);

    // -----------------------------------------------------------------------
    // Stage 3: Statistics
    // -----------------------------------------------------------------------
    const statisticsResult = await this.runDependentStage(
      PipelineStage.STATISTICS,
      runId,
      extractorResult,
      () => this.executeStatistics(extractorResult),
    );
    stageResults.push(statisticsResult);

    // -----------------------------------------------------------------------
    // Stage 4: Readiness
    // -----------------------------------------------------------------------
    const readinessResult = await this.runDependentStage(
      PipelineStage.READINESS,
      runId,
      validatorResult,
      () => this.executeReadiness(validatorResult, statisticsResult),
    );
    stageResults.push(readinessResult);

    // -----------------------------------------------------------------------
    // Stage 5: Suitability
    // -----------------------------------------------------------------------
    const suitabilityResult = await this.runDependentStage(
      PipelineStage.SUITABILITY,
      runId,
      readinessResult,
      () => this.executeSuitability(
        validatorResult,
        statisticsResult,
        readinessResult,
      ),
    );
    stageResults.push(suitabilityResult);

    // -----------------------------------------------------------------------
    // Stage 6: Decision
    //
    // ENG-001F produces a human-reviewable recommendation from all 4 engine
    // outputs. It does NOT make decisions (DR-02) — it recommends.
    // -----------------------------------------------------------------------
    const decisionResult = await this.runDependentStage(
      PipelineStage.DECISION,
      runId,
      suitabilityResult,
      () => this.executeDecision(
        validatorResult,
        statisticsResult,
        readinessResult,
        suitabilityResult,
      ),
    );
    stageResults.push(decisionResult);

    // -----------------------------------------------------------------------
    // Provenance
    // -----------------------------------------------------------------------
    const finishedAt = new Date().toISOString();
    const provenance = buildProvenance(stageResults, startedAt, finishedAt, {
      ...options,
      runId,
      pipelineVersion,
    });

    const result = buildPipelineResult(provenance);

    // Emit pipeline completed
    this.events.emit({
      type: 'PipelineCompleted',
      runId,
      provenance,
      totalDurationMs: provenance.durationMs,
    });

    return result;
  }

  // ---------------------------------------------------------------------------
  // Stage execution helpers
  // ---------------------------------------------------------------------------

  /**
   * Run a stage that has no dependency on previous stage output.
   * (Currently only Extractor.)
   */
  private async runStage<T>(
    stage: PipelineStage,
    runId: string,
    execute: () => Promise<PipelineStageResult<T>>,
  ): Promise<PipelineStageResult<T>> {
    this.events.emit({
      type: 'StageStarted',
      runId,
      stage,
      startedAt: new Date().toISOString(),
    });

    const result = await execute();

    this.events.emit({
      type: result.status === StageOutcome.SUCCESS ? 'StageCompleted' : 'StageFailed',
      runId,
      stage,
      durationMs: result.durationMs,
      ...(result.status === StageOutcome.FAILED ? { error: result.error ?? '' } : {}),
      status: result.status,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return result;
  }

  /**
   * Run a stage that depends on the output of a previous stage.
   * If the previous stage FAILED, this stage is SKIPPED.
   */
  private async runDependentStage<TDep, T>(
    stage: PipelineStage,
    runId: string,
    dependency: PipelineStageResult<TDep>,
    execute: () => Promise<PipelineStageResult<T>>,
  ): Promise<PipelineStageResult<T>> {
    if (dependency.status !== StageOutcome.SUCCESS) {
      const skipped = buildSkippedResult<T>(
        stage,
        ENGINE_VERSIONS[stage],
        `Dependency "${dependency.stage}" ${dependency.status}: ${dependency.error ?? 'unknown error'}`,
      );

      this.events.emit({
        type: 'StageStarted',
        runId,
        stage,
        startedAt: new Date().toISOString(),
      });

      this.events.emit({
        type: 'StageCompleted',
        runId,
        stage,
        durationMs: 0,
        status: StageOutcome.SKIPPED,
      });

      return skipped;
    }

    this.events.emit({
      type: 'StageStarted',
      runId,
      stage,
      startedAt: new Date().toISOString(),
    });

    const result = await execute();

    this.events.emit({
      type: result.status === StageOutcome.SUCCESS ? 'StageCompleted' : 'StageFailed',
      runId,
      stage,
      durationMs: result.durationMs,
      ...(result.status === StageOutcome.FAILED ? { error: result.error ?? '' } : {}),
      status: result.status,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return result;
  }

  // ---------------------------------------------------------------------------
  // Engine Executors
  // ---------------------------------------------------------------------------

  /**
   * Execute the Registry Extractor.
   */
  private async executeExtractor(): Promise<PipelineStageResult<ExtractedRegistries>> {
    const start = performance.now();
    try {
      const extractor = new RegistryExtractor(this.projectRoot);
      const registries = await extractor.extractAll();

      // Validate extractor output
      const validationError = extractorIsValid(registries);
      if (validationError) {
        return buildFailedResult<ExtractedRegistries>(
          PipelineStage.EXTRACTOR,
          ENGINE_VERSIONS[PipelineStage.EXTRACTOR],
          validationError,
          Math.round(performance.now() - start),
        );
      }

      return buildSuccessResult<ExtractedRegistries>(
        PipelineStage.EXTRACTOR,
        ENGINE_VERSIONS[PipelineStage.EXTRACTOR],
        registries,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<ExtractedRegistries>(
        PipelineStage.EXTRACTOR,
        ENGINE_VERSIONS[PipelineStage.EXTRACTOR],
        message,
        Math.round(performance.now() - start),
      );
    }
  }

  /**
   * Execute the canonical validation engine.
   *
   * Runs aggregateValidations() against the extracted registries and wraps
   * the result into a PipelineStageResult. Validation issues are embedded
   * in the output — they do NOT cause the pipeline stage to fail.
   */
  private async executeValidator(
    registries: ExtractedRegistries | null,
  ): Promise<PipelineStageResult<ValidationSummary>> {
    const start = performance.now();
    try {
      if (!registries) {
        return buildFailedResult<ValidationSummary>(
          PipelineStage.VALIDATOR,
          ENGINE_VERSIONS[PipelineStage.VALIDATOR],
          'No ExtractedRegistries available from extractor stage',
          Math.round(performance.now() - start),
        );
      }

      const validationSummary = aggregateValidations(registries);

      return buildSuccessResult<ValidationSummary>(
        PipelineStage.VALIDATOR,
        ENGINE_VERSIONS[PipelineStage.VALIDATOR],
        validationSummary,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<ValidationSummary>(
        PipelineStage.VALIDATOR,
        ENGINE_VERSIONS[PipelineStage.VALIDATOR],
        message,
        Math.round(performance.now() - start),
      );
    }
  }

  /**
   * Execute the Graph Statistics engine.
   * Depends on Extractor output.
   */
  private async executeStatistics(
    extractorResult: PipelineStageResult<ExtractedRegistries>,
  ): Promise<PipelineStageResult<GraphStatistics>> {
    const start = performance.now();
    try {
      const registries = extractorResult.output;
      if (!registries) {
        return buildFailedResult<GraphStatistics>(
          PipelineStage.STATISTICS,
          ENGINE_VERSIONS[PipelineStage.STATISTICS],
          'No ExtractedRegistries available from extractor stage',
          Math.round(performance.now() - start),
        );
      }

      const statistics = computeStatistics(registries);

      return buildSuccessResult<GraphStatistics>(
        PipelineStage.STATISTICS,
        ENGINE_VERSIONS[PipelineStage.STATISTICS],
        statistics,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<GraphStatistics>(
        PipelineStage.STATISTICS,
        ENGINE_VERSIONS[PipelineStage.STATISTICS],
        message,
        Math.round(performance.now() - start),
      );
    }
  }

  /**
   * Execute the Readiness Score engine.
   * Depends on both Validator and Statistics outputs.
   */
  private async executeReadiness(
    validatorResult: PipelineStageResult<ValidationSummary>,
    statisticsResult: PipelineStageResult<GraphStatistics>,
  ): Promise<PipelineStageResult<ReadinessResult>> {
    const start = performance.now();
    try {
      const validationSummary = validatorResult.output;
      const graphStatistics = statisticsResult.output;

      if (!validationSummary) {
        return buildFailedResult<ReadinessResult>(
          PipelineStage.READINESS,
          ENGINE_VERSIONS[PipelineStage.READINESS],
          'No ValidationSummary available from validator stage',
          Math.round(performance.now() - start),
        );
      }

      if (!graphStatistics) {
        return buildFailedResult<ReadinessResult>(
          PipelineStage.READINESS,
          ENGINE_VERSIONS[PipelineStage.READINESS],
          'No GraphStatistics available from statistics stage',
          Math.round(performance.now() - start),
        );
      }

      const readiness = computeReadiness({
        validationSummary,
        graphStatistics,
      });

      return buildSuccessResult<ReadinessResult>(
        PipelineStage.READINESS,
        ENGINE_VERSIONS[PipelineStage.READINESS],
        readiness,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<ReadinessResult>(
        PipelineStage.READINESS,
        ENGINE_VERSIONS[PipelineStage.READINESS],
        message,
        Math.round(performance.now() - start),
      );
    }
  }

  /**
   * Execute the Suitability engine.
   *
   * Runs computeSuitability() against ValidationSummary, GraphStatistics,
   * and ReadinessResult. Produces an Architectural Fit assessment only —
   * no technology or product recommendations (SR-01, SR-02).
   */
  private async executeSuitability(
    validatorResult: PipelineStageResult<ValidationSummary>,
    statisticsResult: PipelineStageResult<GraphStatistics>,
    readinessResult: PipelineStageResult<ReadinessResult>,
  ): Promise<PipelineStageResult<SuitabilityResult>> {
    const start = performance.now();
    try {
      const validationSummary = validatorResult.output;
      const graphStatistics = statisticsResult.output;
      const readiness = readinessResult.output;

      if (!validationSummary) {
        return buildFailedResult<SuitabilityResult>(
          PipelineStage.SUITABILITY,
          ENGINE_VERSIONS[PipelineStage.SUITABILITY],
          'No ValidationSummary available from validator stage',
          Math.round(performance.now() - start),
        );
      }

      if (!graphStatistics) {
        return buildFailedResult<SuitabilityResult>(
          PipelineStage.SUITABILITY,
          ENGINE_VERSIONS[PipelineStage.SUITABILITY],
          'No GraphStatistics available from statistics stage',
          Math.round(performance.now() - start),
        );
      }

      if (!readiness) {
        return buildFailedResult<SuitabilityResult>(
          PipelineStage.SUITABILITY,
          ENGINE_VERSIONS[PipelineStage.SUITABILITY],
          'No ReadinessResult available from readiness stage',
          Math.round(performance.now() - start),
        );
      }

      const suitability = computeSuitability({
        validationSummary,
        graphStatistics,
        readinessResult: readiness,
      });

      return buildSuccessResult<SuitabilityResult>(
        PipelineStage.SUITABILITY,
        ENGINE_VERSIONS[PipelineStage.SUITABILITY],
        suitability,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<SuitabilityResult>(
        PipelineStage.SUITABILITY,
        ENGINE_VERSIONS[PipelineStage.SUITABILITY],
        message,
        Math.round(performance.now() - start),
      );
    }
  }

  /**
   * Execute the Decision Framework (ENG-001F).
   *
   * Consumes all 4 engine outputs and produces a human-reviewable
   * recommendation. Does NOT generate ADRs or execute actions (DR-02).
   */
  private async executeDecision(
    validatorResult: PipelineStageResult<ValidationSummary>,
    statisticsResult: PipelineStageResult<GraphStatistics>,
    readinessResult: PipelineStageResult<ReadinessResult>,
    suitabilityResult: PipelineStageResult<SuitabilityResult>,
  ): Promise<PipelineStageResult<DecisionRecommendation>> {
    const start = performance.now();
    try {
      const validationSummary = validatorResult.output;
      const graphStatistics = statisticsResult.output;
      const readiness = readinessResult.output;
      const suitability = suitabilityResult.output;

      // Check all required inputs (defensive — all should succeed if
      // Suitability stage succeeded, but we still validate individually).
      if (!validationSummary) {
        return buildFailedResult<DecisionRecommendation>(
          PipelineStage.DECISION,
          ENGINE_VERSIONS[PipelineStage.DECISION],
          'No ValidationSummary available from validator stage',
          Math.round(performance.now() - start),
        );
      }

      if (!graphStatistics) {
        return buildFailedResult<DecisionRecommendation>(
          PipelineStage.DECISION,
          ENGINE_VERSIONS[PipelineStage.DECISION],
          'No GraphStatistics available from statistics stage',
          Math.round(performance.now() - start),
        );
      }

      if (!readiness) {
        return buildFailedResult<DecisionRecommendation>(
          PipelineStage.DECISION,
          ENGINE_VERSIONS[PipelineStage.DECISION],
          'No ReadinessResult available from readiness stage',
          Math.round(performance.now() - start),
        );
      }

      if (!suitability) {
        return buildFailedResult<DecisionRecommendation>(
          PipelineStage.DECISION,
          ENGINE_VERSIONS[PipelineStage.DECISION],
          'No SuitabilityResult available from suitability stage',
          Math.round(performance.now() - start),
        );
      }

      const recommendation = produceRecommendation({
        validationSummary,
        graphStatistics,
        readinessResult: readiness,
        suitabilityResult: suitability,
      });

      return buildSuccessResult<DecisionRecommendation>(
        PipelineStage.DECISION,
        ENGINE_VERSIONS[PipelineStage.DECISION],
        recommendation,
        Math.round(performance.now() - start),
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildFailedResult<DecisionRecommendation>(
        PipelineStage.DECISION,
        ENGINE_VERSIONS[PipelineStage.DECISION],
        message,
        Math.round(performance.now() - start),
      );
    }
  }
}
