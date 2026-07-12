---
name: aqliya-ai-feature-gate
description: AI feature implementation — prompt construction, model routing, confidence scoring, evidence grounding, audit logging, human review gates
version: 1.0
date: 2026-07-12
status: active
---

# AQLIYA AI Feature Gate

## When to Load
Load this skill when the task involves:
- Building or modifying any AI/LLM feature
- Prompt construction or template changes
- AI provider routing or fallback logic
- Confidence scoring or AI output evaluation
- AI audit logging or evidence grounding
- Office AI Assistant, AI review, AI advisor features

## Core Rules (from AGENTS.md §12)

Every AI action MUST include:
1. **Source input references** — link generated output to source documents/data
2. **Prompt/action type** — record what kind of AI task was performed
3. **Model/provider** — record which model and provider was used
4. **Generated output** — store output hash + token count at minimum
5. **Confidence/limitation note** — never present AI output as certain
6. **Human review status** — every output starts as `needs_review`
7. **Audit log entry** — `writePlatformAuditLog` with aiProvider, aiModel, taskType
8. **Permission checks** — verify user has AI access for this product
9. **No autonomous decisions** — output boundary must be `draft_only` or `review_required`

## Prompt Construction Rules

### DO
- Use `buildTaskSpecificLayer()` from `prompt-framework.ts` — it sanitizes input
- Use `sanitizePromptValue()` for any user input in prompts
- Include governance context (doctrine, evidence, human approval layers)
- Set explicit output boundaries in every prompt
- Truncate inputs exceeding 2000 characters

### DO NOT
- Use raw template literals with user input: `` `Analyze ${userInput}` `` ❌
- Bypass `buildGovernanceLayer()` or `buildEvidenceLayer()`
- Allow AI to set `outputBoundary` to `final` or `approved`
- Skip `getGovernanceContext()` for any product AI task

## Provider Safety

- All `fetch()` calls to LLM APIs must have `AbortSignal.timeout(30000)`
- Handle `AbortError` gracefully — return user-friendly error, never crash
- Use real confidence calculation, never hardcode confidence values
- Provider fallback: try Anthropic → OpenAI → Ollama (local) in order
- Log provider selection and fallback events to audit trail

## Human Review Gate

Every AI output must:
- Start as `needs_review` status
- Show confidence score prominently
- Link to source evidence where applicable
- Include limitation notes
- Require explicit human action to approve/reject
- Log review action to audit trail

## Pre-Implementation Checklist

Before implementing any AI feature, verify:
- [ ] AGENTS.md §12 rules are addressed
- [ ] Prompt uses `sanitizePromptValue()` for ALL user input
- [ ] Provider call has timeout + error handling
- [ ] Confidence is calculated, not hardcoded
- [ ] Audit log entry is written for every generation
- [ ] Human review gate is enforced (not optional)
- [ ] Output boundary is `draft_only` or `review_required`
- [ ] Permission check verifies product AI access
- [ ] Evidence/source references are linked in output
- [ ] No autonomous final decisions

## Example: Correct AI Action Pattern

```typescript
// ✅ Correct — follows all §12 rules
export async function generateAISuggestion(input: AISuggestionInput) {
  const { organizationId, userId } = await requireAuth();
  
  // 1. Permission check
  await requireAIAccess(userId, organizationId, 'local_content');
  
  // 2. Build governed prompt with sanitization
  const context = getGovernanceContext('lc_content_classification');
  const prompt = buildTaskSpecificLayer('lc_content_classification', {
    accountName: sanitizePromptValue(input.accountName),
    description: sanitizePromptValue(input.description),
    ...context,
  });
  
  // 3. Execute with timeout
  const result = await executeGovernedAI(prompt, {
    timeout: 30000,
    outputBoundary: 'draft_only',
    reviewRequired: true,
  });
  
  // 4. Calculate real confidence
  const confidence = calculateConfidence(result, input);
  
  // 5. Audit log
  await writePlatformAuditLog({
    action: 'ai.suggestion.generated',
    organizationId,
    actorId: userId,
    metadata: {
      aiProvider: result.provider,
      aiModel: result.model,
      taskType: 'lc_content_classification',
      confidence,
      reviewStatus: 'needs_review',
    },
  });
  
  // 6. Return with human review gate
  return {
    suggestion: result.output,
    confidence,
    reviewRequired: true,
    reviewStatus: 'needs_review',
    limitations: result.limitations,
    sourceReferences: result.sourceChunks,
  };
}
```

## Anti-Patterns

```typescript
// ❌ Wrong — raw template, no sanitization, no guard
const prompt = `Classify: ${input.accountName} — ${input.description}`;
const ai = await fetch('https://api.openai.com/v1/chat/completions', {
  body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
});
// Missing: timeout, permission check, audit log, confidence, human review gate
```

## Validation

Before merging any AI feature:
- [ ] `npx tsc --noEmit` passes
- [ ] All AI-related tests pass
- [ ] Manual test: verify audit log entry exists after generation
- [ ] Manual test: verify human review is required before output becomes final
- [ ] Manual test: verify timeout works (simulate slow API)
