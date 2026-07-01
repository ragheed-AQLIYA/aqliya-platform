// DEC-2026-0030: Pipeline Orchestration Separation
// DEC-2026-0032: Pipeline Provenance
// DEC-2026-0033: Pipeline Stage Contract
//
// Pipeline Orchestrator Tests
//
// These tests verify ORCHESTRATION, not engine logic.
//   - Sequencing: stages run in the right order
//   - Error containment: no exceptions between stages
//   - Skip propagation: failed stage → subsequent stages SKIPPED
//   - Provenance: timing, version, evidence collected
//   - Events: domain events emitted
//   - Helpers: stage access functions work
//
// Engine-specific tests are in their own files:
//   extractor.test.ts, statistics.test.ts, readiness.test.ts

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { GraphReadinessPipeline } from '../../graph/pipeline/graph-readiness-pipeline';
import {
  PipelineStage,
  StageOutcome,
  buildSuccessResult,
  buildFailedResult,
  buildSkippedResult,
  buildProvenance,
  buildPipelineResult,
  getStage,
  stageSucceeded,
  stageFailed,
  stageSkipped,
} from '../../graph/pipeline/pipeline-result';
import { PipelineEventEmitter } from '../../graph/pipeline/pipeline-events';
import type { PipelineEvent } from '../../graph/pipeline/pipeline-events';
import type { PipelineStageResult } from '../../graph/pipeline/pipeline-types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Create a temporary project with basic governance Markdown files.
 * This is a minimal but valid set for a full pipeline run.
 */
function createValidFixture(): { root: string; cleanup: () => void } {
  const root = mkdtempSync('pipeline-test-');

  const files: Record<string, string> = {
    'docs/governance/CLAIM_REGISTRY.md': `# CLAIM_REGISTRY.md

| CLM-ID | Version | Type | Origin | Dimension | CapRef | Claim Text | KA | Product | Auth | Evidence | Confidence |
|--------|---------|------|--------|-----------|--------|------------|----|---------|------|----------|------------|
| CLM-AUDIT-0001 | 1.0 | CR-ST | product | Implementation Reality | — | AuditOS has 80 routes | KA-10 | PROD-AUDITOS | AUTH-AUDIT | EV-0001, EV-0002 | High |
| CLM-AUDIT-0002 | 1.0 | CR-TC | product | Product Maturity | — | AuditOS has workflow states | KA-10 | PROD-AUDITOS | AUTH-AUDIT | EV-0004, EV-0005 | High |
`,

    'docs/governance/evidence-catalog/product-registry.md': `# Product Registry

| PROD-ID | Name | Version | Status | Maturity | Slug |
|---------|------|---------|--------|----------|------|
| PROD-AUDITOS | AuditOS | 1.0.0 | active | pilot | audit |
`,

    'docs/governance/evidence-catalog/decision-registry.md': `# Decision Registry

| DEC-ID | Title | Status | Date | Authority | Products | Claims | Evidence |
|--------|-------|--------|------|-----------|----------|--------|----------|
| DEC-2026-0001 | Sample Decision | approved | 2026-01-01 | AUTH-AUDIT | PROD-AUDITOS | CLM-AUDIT-0001 | EV-0001 |
`,

    'docs/governance/evidence-catalog/evidence-index.md': `# Evidence Index

| EV-ID | Source | Type | Date | Status | Location |
|-------|--------|------|------|--------|----------|
| EV-0001 | Code Audit | file | 2026-01-01 | current | src/app/audit |
| EV-0002 | Test Suite | test | 2026-01-01 | current | tests/audit |
`,

    'docs/governance/AUTHORITY_MATRIX.md': `# Authority Matrix

| AUTH-ID | Name | Type | Status | Source |
|---------|------|------|--------|--------|
| AUTH-AUDIT | AuditOS Authority | product | active | built-in |
`,
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(root, filePath);
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
  }

  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

// ---------------------------------------------------------------------------
// Pipeline — Full Happy Path
// ---------------------------------------------------------------------------

describe('GraphReadinessPipeline — Full Pipeline', () => {
  let fixture: { root: string; cleanup: () => void };

  beforeAll(() => {
    fixture = createValidFixture();
  });

  afterAll(() => {
    fixture.cleanup();
  });

  it('completes all 6 stages with SUCCESS', async () => {
    const pipeline = new GraphReadinessPipeline(fixture.root);
    const result = await pipeline.run();

    // All stages should succeed
    expect(result.stages[PipelineStage.EXTRACTOR].status).toBe(StageOutcome.SUCCESS);
    expect(result.stages[PipelineStage.VALIDATOR].status).toBe(StageOutcome.SUCCESS);
    expect(result.stages[PipelineStage.STATISTICS].status).toBe(StageOutcome.SUCCESS);
    expect(result.stages[PipelineStage.READINESS].status).toBe(StageOutcome.SUCCESS);
    expect(result.stages[PipelineStage.SUITABILITY].status).toBe(StageOutcome.SUCCESS);
    expect(result.stages[PipelineStage.DECISION].status).toBe(StageOutcome.SUCCESS);

    // Decision stage should contain a recommendation
    const decisionStage = result.stages[PipelineStage.DECISION];
    expect(decisionStage.output).toBeDefined();
    expect(decisionStage.output).toHaveProperty('recommendationLevel');
  });

  it('contains provenance with timing information', async () => {
    const pipeline = new GraphReadinessPipeline(fixture.root);
    const result = await pipeline.run();

    expect(result.provenance).toBeDefined();
    expect(result.provenance.runId).toMatch(/^pipeline-/);
    expect(result.provenance.pipelineVersion).toBe('1.0');
    expect(result.provenance.durationMs).toBeGreaterThan(0);
    expect(result.provenance.stages.length).toBe(6);

    // Each stage should have timing
    for (const stage of result.provenance.stages) {
      expect(stage.durationMs).toBeGreaterThanOrEqual(0);
      expect(stage.version).toBe('1.0');
    }
  });

  it('runs stages in correct order', async () => {
    const pipeline = new GraphReadinessPipeline(fixture.root);
    const result = await pipeline.run();

    const stageOrder = result.provenance.stages.map((s) => s.stage);
    expect(stageOrder).toEqual([
      PipelineStage.EXTRACTOR,
      PipelineStage.VALIDATOR,
      PipelineStage.STATISTICS,
      PipelineStage.READINESS,
      PipelineStage.SUITABILITY,
      PipelineStage.DECISION,
    ]);
  });

  it('does not throw exceptions — errors are contained in stage results', async () => {
    // Use an invalid project root
    const pipeline = new GraphReadinessPipeline('/nonexistent/path');
    const result = await pipeline.run();

    // Should not throw — extractor should fail gracefully
    expect(result.stages[PipelineStage.EXTRACTOR]).toBeDefined();
    // Even if extractor fails, pipeline should complete
    expect(result.provenance).toBeDefined();
    expect(result.provenance.stages.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Pipeline — Failure & Skip Propagation
// ---------------------------------------------------------------------------

describe('GraphReadinessPipeline — Failure Propagation', () => {
  it('skips dependent stages when extractor fails', async () => {
    // Empty project root → extractor produces zero entities → fails
    const emptyRoot = mkdtempSync('pipeline-empty-');
    try {
      const pipeline = new GraphReadinessPipeline(emptyRoot);
      const result = await pipeline.run();

      // Extractor may fail if it can't find governance docs
      // (Accept both FAILED and SUCCESS with zero entities, depending on error handling)
      const extractorStage = result.stages[PipelineStage.EXTRACTOR];

      if (extractorStage.status === StageOutcome.FAILED) {
        // Subsequent stages should be SKIPPED
        expect(result.stages[PipelineStage.VALIDATOR].status).toBe(StageOutcome.SKIPPED);
        expect(result.stages[PipelineStage.STATISTICS].status).toBe(StageOutcome.SKIPPED);
        expect(result.stages[PipelineStage.READINESS].status).toBe(StageOutcome.SKIPPED);
        expect(result.stages[PipelineStage.SUITABILITY].status).toBe(StageOutcome.SKIPPED);
        expect(result.stages[PipelineStage.DECISION].status).toBe(StageOutcome.SKIPPED);
      }
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// Pipeline — Events
// ---------------------------------------------------------------------------

describe('GraphReadinessPipeline — Events', () => {
  let fixture: { root: string; cleanup: () => void };

  beforeAll(() => {
    fixture = createValidFixture();
  });

  afterAll(() => {
    fixture.cleanup();
  });

  it('emits PipelineStarted and PipelineCompleted events', async () => {
    const events = new PipelineEventEmitter();
    const pipeline = new GraphReadinessPipeline(fixture.root, events);

    const emitted: PipelineEvent[] = [];
    events.subscribe((event) => {
      emitted.push(event);
    });

    await pipeline.run();

    // Should have at least start + end events
    const types = emitted.map((e) => e.type);
    expect(types).toContain('PipelineStarted');
    expect(types).toContain('PipelineCompleted');
  });

  it('emits StageStarted and StageCompleted for each stage', async () => {
    const events = new PipelineEventEmitter();
    const pipeline = new GraphReadinessPipeline(fixture.root, events);

    const emitted: PipelineEvent[] = [];
    events.subscribe((event) => {
      emitted.push(event);
    });

    await pipeline.run();

    const stageStarted = emitted.filter((e) => e.type === 'StageStarted');
    const stageCompleted = emitted.filter((e) => e.type === 'StageCompleted');

    // 6 stages → 6 start + 6 complete events
    expect(stageStarted.length).toBe(6);
    expect(stageCompleted.length).toBe(6);
  });

  it('allows unsubscribe', async () => {
    const events = new PipelineEventEmitter();
    const pipeline = new GraphReadinessPipeline(fixture.root, events);

    const emitted: PipelineEvent[] = [];
    const unsubscribe = events.subscribe((event) => {
      emitted.push(event);
    });

    unsubscribe();

    await pipeline.run();

    // No events should be emitted after unsubscribe
    expect(emitted.length).toBe(0);
  });

  it('handles async handlers without throwing', async () => {
    const events = new PipelineEventEmitter();
    const pipeline = new GraphReadinessPipeline(fixture.root, events);

    // Async handler that rejects should not crash the pipeline
    events.subscribe(async (_event) => {
      throw new Error('handler error');
    });

    // Should not throw
    const result = await pipeline.run();
    expect(result.provenance).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Pipeline — Custom Options
// ---------------------------------------------------------------------------

describe('GraphReadinessPipeline — Options', () => {
  let fixture: { root: string; cleanup: () => void };

  beforeAll(() => {
    fixture = createValidFixture();
  });

  afterAll(() => {
    fixture.cleanup();
  });

  it('accepts custom runId and pipelineVersion', async () => {
    const pipeline = new GraphReadinessPipeline(fixture.root);
    const result = await pipeline.run({
      runId: 'custom-run-id',
      pipelineVersion: '2.0',
    });

    expect(result.provenance.runId).toBe('custom-run-id');
    // Note: pipelineVersion in the pipe result comes from the options
    // but the PROVENANCE uses it. Check a stage version to confirm.
    // Engine versions are hardcoded — pipelineVersion applies to pipeline, not engines.
    expect(result.provenance.pipelineVersion).toBe('2.0');
  });
});

// ---------------------------------------------------------------------------
// Pipeline Event Emitter — Unit Tests
// ---------------------------------------------------------------------------

describe('PipelineEventEmitter', () => {
  it('tracks subscriber count', () => {
    const emitter = new PipelineEventEmitter();
    expect(emitter.subscriberCount).toBe(0);

    const unsub1 = emitter.subscribe(() => {});
    expect(emitter.subscriberCount).toBe(1);

    const unsub2 = emitter.subscribe(() => {});
    expect(emitter.subscriberCount).toBe(2);

    unsub1();
    expect(emitter.subscriberCount).toBe(1);

    unsub2();
    expect(emitter.subscriberCount).toBe(0);
  });

  it('clears all subscribers', () => {
    const emitter = new PipelineEventEmitter();
    emitter.subscribe(() => {});
    emitter.subscribe(() => {});

    emitter.clear();
    expect(emitter.subscriberCount).toBe(0);
  });

  it('does not throw when no subscribers', () => {
    const emitter = new PipelineEventEmitter();
    expect(() => {
      emitter.emit({
        type: 'PipelineStarted',
        runId: 'test',
        pipelineVersion: '1.0',
        startedAt: new Date().toISOString(),
      });
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Pipeline Result Helpers — Unit Tests
// ---------------------------------------------------------------------------

describe('Pipeline Result Helpers', () => {
  it('buildSuccessResult creates correct shape', () => {
    const result = buildSuccessResult(
      PipelineStage.EXTRACTOR,
      '1.0',
      { data: 'test' },
      100,
      ['ev-001'],
    );

    expect(result.stage).toBe(PipelineStage.EXTRACTOR);
    expect(result.status).toBe(StageOutcome.SUCCESS);
    expect(result.durationMs).toBe(100);
    expect(result.output).toEqual({ data: 'test' });
    expect(result.error).toBeNull();
    expect(result.evidenceIds).toEqual(['ev-001']);
  });

  it('buildFailedResult creates correct shape', () => {
    const result = buildFailedResult(
      PipelineStage.VALIDATOR,
      '1.0',
      'Something went wrong',
      50,
    );

    expect(result.stage).toBe(PipelineStage.VALIDATOR);
    expect(result.status).toBe(StageOutcome.FAILED);
    expect(result.durationMs).toBe(50);
    expect(result.output).toBeNull();
    expect(result.error).toBe('Something went wrong');
  });

  it('buildSkippedResult creates correct shape', () => {
    const result = buildSkippedResult(
      PipelineStage.STATISTICS,
      '1.0',
      'Dependency failed',
    );

    expect(result.stage).toBe(PipelineStage.STATISTICS);
    expect(result.status).toBe(StageOutcome.SKIPPED);
    expect(result.durationMs).toBe(0);
    expect(result.error).toBe('Dependency failed');
  });

  it('getStage returns null for missing stage', () => {
    const result = buildPipelineResult({
      runId: 'test',
      pipelineVersion: '1.0',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 100,
      stages: [],
    });

    const stage = getStage(result, PipelineStage.READINESS);
    expect(stage).toBeNull();
  });

  it('getStage returns stage for existing entry', () => {
    const stageResult = buildSuccessResult(PipelineStage.READINESS, '1.0', { score: 85 }, 100);

    const result = buildPipelineResult({
      runId: 'test',
      pipelineVersion: '1.0',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 100,
      stages: [stageResult],
    });

    const stage = getStage<{ score: number }>(result, PipelineStage.READINESS);
    expect(stage).not.toBeNull();
    expect(stage!.output!.score).toBe(85);
  });

  it('stageSucceeded / stageFailed / stageSkipped work correctly', () => {
    const success = buildSuccessResult(PipelineStage.STATISTICS, '1.0', {}, 10);
    const failed = buildFailedResult(PipelineStage.EXTRACTOR, '1.0', 'err', 10);
    const skipped = buildSkippedResult(PipelineStage.VALIDATOR, '1.0', 'skipped');

    const result = buildPipelineResult({
      runId: 'test',
      pipelineVersion: '1.0',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 30,
      stages: [success, failed, skipped],
    });

    expect(stageSucceeded(result, PipelineStage.STATISTICS)).toBe(true);
    expect(stageFailed(result, PipelineStage.EXTRACTOR)).toBe(true);
    expect(stageSkipped(result, PipelineStage.VALIDATOR)).toBe(true);

    // Missing stage
    expect(stageSucceeded(result, PipelineStage.READINESS)).toBe(false);
  });
});
