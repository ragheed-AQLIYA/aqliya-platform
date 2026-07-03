# Institutional Memory

**Status:** L6 Production-hardened  
**Owner:** Platform Team  
**Last Updated:** 2026-06-30

## Overview
Shared institutional intelligence engine under AQLIYA Core. Captures events, collections, and intelligence graph data to power cross-product institutional memory.

## Asset Map
- **Routes:** 4 (/institutional-memory/*, /institutional-memory/graph, /institutional-memory/events, /institutional-memory/collections)
- **Server Actions:** 2 (src/actions/institutional-memory-*.ts)
- **Prisma Models:** 10 (InstitutionalMemoryEvent, InstitutionalMemoryCollection, IntelligenceGraphNode, IntelligenceGraphEdge, InstitutionalMemoryAuditEvent, etc.)
- **Components:** 2 in src/components/institutional-memory/
- **Documentation:** 1 file (runbook)
- **Tests:** 0 files — none yet
- **Seed Data:** ❌ Not yet created
- **Runbook:** ✅ docs/runbooks/institutional-memory-guide.md
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated test suite
- No seed data
- Missing 
ot-found.tsx state pages

## Roadmap
- Add test suite
- Add seed data
- Add not-found states
