---
name: eng-ai-pipeline-review
description: AI pipeline governance — prompt quality, provider routing, hallucination risk, cost, fallback, human review gate
version: 1.0
date: 2026-07-13
status: active
owner: Layer 8 — AI
inputs: AI pipeline or prompt
outputs: AI governance report with compliance status
dependencies: aqliya-ai-feature-gate
---

# Engineering AI Pipeline Review

## Checklist
1. **Prompt Quality**: Clear, bounded, no injection risks
2. **Provider Routing**: Correct provider for task type, fallback configured
3. **Sanitization**: Prompt passes through sanitizer before dispatch
4. **Human Review**: AI output cannot trigger autonomous state change
5. **Cost**: Within budget, tracking enabled
6. **Hallucination**: Evaluation framework active, confidence scored
7. **Auditability**: AI interactions logged with traceability

## Output
```md
## AI Pipeline Review: <pipeline>
| Finding | Severity | Category | Recommendation |
```
