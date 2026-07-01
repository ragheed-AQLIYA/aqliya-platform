# ContentStudio

**Status:** L4 Usable v0.1  
**Owner:** Platform Team  
**Last Updated:** 2026-06-30

## Overview
Content system for creating and managing structured institutional content. Currently at v0.1 usability level.

## Asset Map
- **Routes:** 5 (/content-studio/*) — Dashboard, Projects, Content Items, Templates, Settings
- **Server Actions:** 1 (embedded in route handler)
- **Prisma Models:** 7 (ContentStudioProject, ContentStudioItem, ContentStudioTemplate, ContentStudioVersion, ContentStudioReview, ContentStudioApproval, ContentStudioAuditEvent)
- **Components:** 0 (embedded directly in route files)
- **Documentation:** 1 file in docs/assets/content-studio/
- **Tests:** 1 file in src/__tests__/unit/content-studio/
- **Seed Data:** ✅ prisma/seed-content-studio.ts
- **Runbook:** ❌ Not yet created
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated component folder (logic embedded in route files)
- Loading states missing on sub-routes
- Low test coverage (only 1 test file)
- No runbook

## Roadmap
- L5: Component separation into src/components/content-studio/
- Add loading/error states
- Increase test coverage
- Create operator runbook
