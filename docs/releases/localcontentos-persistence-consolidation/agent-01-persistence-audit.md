# Agent 01 Persistence Audit

## Before
- review.ts, outputs.ts, evidence.ts, ai.ts used readStore/writeStore directly
- getProject/getCampaign lacked organization scoping

## After
- ContentStudioRepository interface
- FileContentStudioRepository sole store accessor
- Cross-org reads return null
