# Office AI Assistant

**Status:** L6 Production-hardened  
**Owner:** AI Team  
**Last Updated:** 2026-06-30

## Overview
Governed shared work assistant application on AQLIYA Core. Provides document-aware responses, task categories, and action logs with human oversight.

## Asset Map
- **Routes:** 3 (/assistant/*, /assistant/stats)
- **Server Actions:** 3 (src/actions/assistant-*.ts)
- **Prisma Models:** 6 (AssistantSession, AssistantMessage, AssistantTaskCategory, AssistantActionLog, AssistantSourceReference, AssistantFeedback)
- **Components:** 3 in src/components/assistant/
- **Documentation:** 3 files in docs/assets/assistant/
- **Tests:** 0 files — none yet
- **Seed Data:** ✅ prisma/seed-office-ai.ts
- **Runbook:** ❌ Not yet created
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated test suite
- No runbook

## Roadmap
- Add test suite
- Create operator runbook
