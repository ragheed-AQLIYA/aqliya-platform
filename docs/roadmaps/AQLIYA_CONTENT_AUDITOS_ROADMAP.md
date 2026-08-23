# AQLIYA Content + AuditOS Roadmap

**Date:** 2026-08-17
**Status:** Evidence-driven, read-only
**Scope:** Content backlog, AuditOS backlog, platform enablement, execution waves
**Methodology:** Direct repository evidence, ranked by business impact

---

## 1. Executive Synthesis

### 1.1 Current State

| Dimension | Content | AuditOS |
|-----------|---------|---------|
| Infrastructure | L5 (mature governance) | L5 (mature domain model) |
| Content/Domain | L2 (minimal content) | L4 (real implementation) |
| AI Grounding | L1 (dormant) | L1 (dormant) |
| Test Coverage | L1 (low) | L1 (critically low) |
| Production Readiness | L1 (needs activation) | L3 (needs activation) |

### 1.2 Key Insight

Both Content and AuditOS have mature infrastructure but are dormant. The gap is activation, not architecture.

### 1.3 Strategic Priority

1. **Content First:** Knowledge must exist before AI can ground on it
2. **AuditOS Second:** AuditOS is the primary consumer of knowledge
3. **Platform Third:** Enable the infrastructure that connects them

---

## 2. Content Backlog (P1)

### 2.1 P0 — Must Fix Before Any Content Use

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| C-01 | RAG pipeline blocked | AI cannot retrieve from knowledge base | Medium |
| C-02 | All AI feature flags OFF | Deterministic-only AI | Low |
| C-03 | No Arabic authoritative knowledge | Arabic UX but English-only knowledge | High |

### 2.2 P1 — Must Fix for Pilot

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| C-04 | ISA corpus 90% incomplete | 90% of ISA checks impossible | High |
| C-05 | Local Content not admitted | No production LC knowledge | Medium |
| C-06 | Content Studio empty | No production content | Medium |
| C-07 | IFRS executable topics limited | 17 of 50+ topics | Medium |

### 2.3 P2 — Must Fix for Production

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| C-08 | No supersession tracking | Cannot determine current vs. superseded | Medium |
| C-09 | No effective-date activation | Rules may apply outside period | Medium |
| C-10 | Knowledge bridge filesystem-based | Not governed | High |
| C-11 | Level B-E authority levels empty | Only Level A | High |

### 2.4 P3 — Should Fix for Completeness

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| C-12 | Lineage chains not validated | Audit trail gaps | Low |
| C-13 | Confidence scores all 95 | No gradient | Low |
| C-14 | ISQM 2 missing | Quality management incomplete | Low |

---

## 3. AuditOS Backlog (P2)

### 3.1 P0 — Must Fix Before Any Pilot

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| A-01 | `isUsingMockData` not surfaced | Users view fabricated data | Low |
| A-02 | All rules engine flags OFF | No automated rule evaluation | Low |
| A-03 | Coverage thresholds critically low | High regression risk | High |

### 3.2 P1 — Must Fix for Production

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| A-04 | ISA corpus 90% incomplete | Most ISA checks impossible | High |
| A-05 | Knowledge bridge filesystem-based | Not governed | High |
| A-06 | Confidence scores hardcoded | No gradient scoring | Low |
| A-07 | Mock data hidden from UI | False sense of completeness | Low |

### 3.3 P2 — Must Fix for Scale

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| A-08 | No Arabic rules language support | Arabic-only users | High |
| A-09 | No effective-date-based activation | Rules outside period | Medium |
| A-10 | No supersession tracking | Version chains | Medium |
| A-11 | Presentation engine not validated | FS presentation untested | Medium |

### 3.4 P3 — Should Fix for Completeness

| # | Finding | Impact | Effort |
|---|---------|--------|--------|
| A-12 | No ISQM 2 | Quality management incomplete | Low |
| A-13 | No Level B-E authority content | No firm methodology | High |
| A-14 | Lineage chains not validated | Audit trail gaps | Low |

---

## 4. Platform Enablement Backlog (P3)

### 4.1 Infrastructure

| # | Item | Impact | Effort |
|---|------|--------|--------|
| P-01 | Activate `ai.rag` flag | Enables RAG pipeline | Low |
| P-02 | Activate `ai.real-providers` flag | Enables real AI providers | Low |
| P-03 | Activate rules engine flags | Enables automated evaluation | Low |
| P-04 | Vectorize admitted assets | Enables semantic search | Medium |
| P-05 | Governed knowledge bridge | Replaces filesystem loading | High |

### 4.2 Security

| # | Item | Impact | Effort |
|---|------|--------|--------|
| S-01 | Surface `isUsingMockData` | Prevents false data viewing | Low |
| S-02 | Add Arabic rules | Supports Arabic-first UX | High |
| S-03 | Effective-date activation | Prevents out-of-period rules | Medium |

### 4.3 Quality

| # | Item | Impact | Effort |
|---|------|--------|--------|
| Q-01 | Increase test coverage | Reduces regression risk | High |
| Q-02 | Add ISA standards | Enables more checks | High |
| Q-03 | Add ISQM 2 | Completes quality management | Low |

---

## 5. Execution Waves

### Wave 0: Safety (Immediate)

**Goal:** Surface hidden risks, activate dormant infrastructure

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Surface `isUsingMockData` to UI | AuditOS | Low | ✅ DONE — MockDataBanner added |
| Activate `ai.rag` flag | Platform | Low | ✅ Already ON |
| Activate `ai.real-providers` flag | Platform | Low | ✅ Already ON |
| Activate rules engine flags | Platform | Low | ✅ Already ON |
| Document mock data usage | AuditOS | Low | ✅ DONE — Banner shows Arabic+English warning |

**Exit Criteria:** ✅ Users can see mock data warning. RAG and rules engines are active.

### Wave 1: Content Foundation

**Goal:** Populate knowledge base with authoritative content

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Ingest remaining IFRS standards | Content | Medium | 17 → 50+ executable topics |
| Ingest ISA 315, 330, 500, 700 | Content | High | ISA coverage 2 → 6 |
| Ingest ISQM 2 | Content | Low | Complete quality management |
| Ingest remaining SOCPA standards | Content | Medium | SOCPA coverage complete |
| Admit Local Content assets | Content | Medium | LC knowledge in production |

**Exit Criteria:** 100+ admitted standards. ISA coverage > 20%. Local Content admitted.

### Wave 2: Content Population

**Goal:** Enable AI grounding on knowledge

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Vectorize all admitted assets | Platform | Medium | Semantic search enabled |
| Build governed knowledge bridge | Platform | High | Replace filesystem loading |
| Add Arabic knowledge | Content | High | Arabic-first UX |
| Activate Content Studio | Content | Medium | Production content items |
| Add effective-date activation | Platform | Medium | Time-based rule filtering |

**Exit Criteria:** RAG retrieval works. Knowledge bridge is governed. Arabic content exists.

### Wave 3: AuditOS Domain Integrity

**Goal:** Strengthen AuditOS domain model

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Increase test coverage to 60% | AuditOS | High | Reduced regression risk |
| Add supersession tracking | AuditOS | Medium | Version chain awareness |
| Add confidence gradient | Content | Low | Differentiated scoring |
| Validate presentation engine | AuditOS | Medium | FS presentation tested |
| Add Arabic rules language | Content | High | Arabic-only users |

**Exit Criteria:** Test coverage > 60%. Supersession tracked. Arabic rules available.

### Wave 4: Knowledge × AuditOS

**Goal:** Connect knowledge to audit workflow

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Integrate IFRS rules with audit workflow | AuditOS | Medium | Automated IFRS checks |
| Integrate ISA rules with audit workflow | AuditOS | Medium | Automated ISA checks |
| Integrate SOCPA rules with audit workflow | AuditOS | Medium | Automated SOCPA checks |
| Add knowledge-enriched disclosures | AuditOS | Medium | AI-assisted notes |
| Add risk assessment knowledge | AuditOS | Medium | Knowledge-grounded risk |

**Exit Criteria:** Rules engines evaluate in audit workflow. Disclosures are knowledge-enriched.

### Wave 5: AI Grounding

**Goal:** Enable knowledge-grounded AI

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Enable RAG retrieval in AI orchestration | Platform | Medium | AI uses knowledge base |
| Add citation tracking | Platform | Medium | AI outputs cite sources |
| Add budget quotas | Platform | Low | Cost control |
| Add streaming support | Platform | Low | Real-time AI responses |
| Validate AI grounding quality | Platform | Medium | AI outputs are accurate |

**Exit Criteria:** AI retrieves from knowledge base. Citations are traceable. Budget is controlled.

### Wave 6: Product Completion

**Goal:** Complete AuditOS to L5

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Complete ISA corpus (30+ standards) | Content | High | Full ISA coverage |
| Complete Level B-E authority content | Content | High | Firm methodology |
| Add knowledge analytics | Platform | Medium | Usage tracking |
| Add real-time standard updates | Content | Medium | Stay current |
| Complete test coverage to 80% | AuditOS | High | Production quality |

**Exit Criteria:** ISA coverage > 90%. Firm methodology exists. Test coverage > 80%.

### Wave 7: Verification

**Goal:** Validate everything works end-to-end

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| End-to-end workflow test | QA | High | Full flow validated |
| Knowledge-to-AI pipeline test | QA | Medium | AI grounding validated |
| Security audit | Security | Medium | Vulnerabilities found |
| Performance test | Platform | Medium | Scale validated |
| Pilot readiness review | All | Low | Go/No-Go decision |

**Exit Criteria:** All tests pass. Security audit clean. Performance acceptable. Pilot ready.

---

## 6. Timeline Estimate

| Wave | Duration | Dependencies |
|------|----------|-------------|
| Wave 0: Safety | 1-2 days | None |
| Wave 1: Content Foundation | 1-2 weeks | Wave 0 |
| Wave 2: Content Population | 2-3 weeks | Wave 1 |
| Wave 3: AuditOS Domain Integrity | 2-3 weeks | Wave 0 |
| Wave 4: Knowledge × AuditOS | 2-3 weeks | Waves 1, 3 |
| Wave 5: AI Grounding | 2-3 weeks | Wave 2 |
| Wave 6: Product Completion | 4-6 weeks | Waves 4, 5 |
| Wave 7: Verification | 1-2 weeks | Wave 6 |

**Total estimated time:** 12-18 weeks (3-4.5 months)

---

## 7. Success Criteria

### 7.1 Content Success

| Metric | Current | Target |
|--------|---------|--------|
| Admitted standards | 56 | 100+ |
| ISA coverage | 6% (2/30+) | 80%+ |
| IFRS executable topics | 17 | 50+ |
| Arabic knowledge | 0 | 50+ |
| RAG-enabled assets | 0 | 100+ |

### 7.2 AuditOS Success

| Metric | Current | Target |
|--------|---------|--------|
| Test coverage | 24-33% | 80%+ |
| Rules engines active | 0/3 | 3/3 |
| Mock data surfaced | No | Yes |
| Arabic rules | 0 | 50+ |

### 7.3 Platform Success

| Metric | Current | Target |
|--------|---------|--------|
| Feature flags active | 0/8 | 8/8 |
| Knowledge bridge | Filesystem | API/Database |
| AI grounding | Dormant | Active |
| Budget quotas | Off | On |

---

## 8. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| RAM issues during vectorization | High | Vectorize in batches, monitor memory |
| Breaking existing tests | High | Run tests after each change |
| Mock data surfacing reveals issues | Medium | Document known limitations |
| ISA ingestion incomplete | Medium | Prioritize most-used standards |
| Arabic knowledge quality | Medium | Native Arabic review |

---

## 9. Final Recommendation

**The single most impactful action:** Execute Wave 0 (Safety) immediately. This takes 1-2 days and transforms AQLIYA from "has dormant infrastructure" to "has active, transparent systems." Users see mock data warnings. RAG and rules engines are activated. The platform is honest about its current state.

**The second most impactful action:** Execute Wave 1 (Content Foundation) in parallel with Wave 3 (AuditOS Domain Integrity). This populates the knowledge base and strengthens the audit model simultaneously, preparing for Wave 4 (Knowledge × AuditOS) where they connect.

**The third most impactful action:** Execute Wave 5 (AI Grounding) after Wave 2 (Content Population). This enables the "knowledge-grounded AI" capability that differentiates AQLIYA from generic audit tools.

---

*This document was produced as part of the AQLIYA Content + AuditOS Reality Audit on 2026-08-17. No source code was modified.*
