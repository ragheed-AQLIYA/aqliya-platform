---
title: Documentation Writing Standards
document_id: 21.01
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Critical
depth_level: Level 2 - Domain Theory
related_documents: 00.01, 00.02, 21.02, 21.04, 21.10
---

# Documentation Writing Standards

## 1. Purpose

This document defines the writing standards for all documents within the AQLIYA Theoretical Reference System. It establishes voice, tone, structure, formatting, and language conventions so that every document — regardless of author — reads as part of a single coherent system. These standards complement the template structure defined in 00-document-template.md by specifying how each section should be written, not just what sections must exist. Without explicit writing standards, documents drift in voice, depth, and quality, undermining the intellectual coherence that the theoretical reference system exists to preserve.

## 2. Thesis

The AQLIYA Theoretical Reference System is a single intellectual work, not a collection of independent documents. Every document must read as if it were written by the same author, for the same audience, with the same intellectual standards. Writing standards enforce this unity. They are not stylistic preferences — they are structural requirements for maintaining a coherent body of theory across hundreds of documents and multiple authors over years.

## 3. Problem

Documentation systems decay through inconsistency. Authors write in different voices, target different depths, use different terminology, and structure arguments differently. Over time, the system becomes a patchwork of documents that contradict each other in tone, contradict each other in content, and contradict the single intellectual thesis they are meant to express. The reader — a new team member, a customer evaluating the philosophy, a partner reviewing a theory — cannot develop a coherent understanding from inconsistent documents. The system fails at its primary purpose.

## 4. Why Existing Systems Fail

Corporate wikis treat documentation as a collection of independently authored pages. No unifying standards. Confluence spaces become information dumps with inconsistent voice, depth, and accuracy. Technical documentation guides focus on formatting (headings, code blocks, tables) but not on intellectual coherence — voice, argument structure, terminology discipline, and depth consistency. Academic writing standards are too rigid for practical documentation and do not account for the operational, product, and commercial dimensions that theory documents must cover. The 00-document-template.md defines the structure. These standards define the writing practice within that structure.

## 5. AQLIYA Philosophy

The theoretical reference system is a single coherent thesis expressed across multiple documents. Writing standards preserve consistency without constraining substance. The voice is authoritative but not academic, precise but not pedantic, confident but not arrogant. The audience is an intelligent professional — an auditor, a product manager, an engineer — who needs to understand AQLIYA's position, reasoning, and implications without decoding jargon or navigating contradictions. Every document serves this reader: it states its thesis clearly, supports it with reasoning, connects it to operational reality, and makes its implications explicit.

## 6. Core Principles

1. **One system, one voice.** Every document reads as if written by the same author. Voice is authoritative, professional, direct. No first-person pronouns. No jokes. No marketing language. No hedging.

2. **Precision over flourish.** Use the exact term every time. Avoid synonyms for variety. If the term is "decision object," do not also say "decision record," "decision artifact," or "decision entity." Terminology consistency is more important than prose variety.

3. **Active voice, present tense.** "The system enforces governance" not "Governance is enforced by the system." Present tense for current positions. Past tense only for historical context.

4. **Claim, support, connect.** Every claim must be supported by reasoning. Every reasoning must connect to AQLIYA philosophy or doctrine. Unsupported claims are opinions, not theory.

5. **Depth consistency within depth_level.** Level 1 documents define core doctrine (why). Level 2 documents develop domain theory (what and why). Level 3 documents specify models and frameworks (how). Level 4 documents define terms. Level 5 documents communicate narratives. Each level has its expected depth, scope, and specificity.

6. **Concrete over abstract.** Prefer specific statements over general ones. "The reviewer examines evidence" not "The system facilitates examination activities." If an abstract concept must be used, ground it in an example or operational implication.

7. **No self-reference.** Do not reference "this document." Do not say "as discussed above" or "as we will see later." The document is a linear reading experience; the structure handles navigation.

8. **Every section stands alone.** A reader should be able to read any section — 8. Operational Implications, 14. Commercial Implications — and understand it without reading prior sections. Brief contextual restatement is acceptable; dependency on earlier sections is not.

## 7. Key Concepts

- **System Voice:** The consistent authorial voice that all documents share. Authoritative, direct, professional. No first-person, no humor, no hedging, no marketing.

- **Terminology Discipline:** Using the exact same term for the same concept across every document. No synonyms for variety. Terminology is defined in Part 17 and must be used consistently.

- **Depth Level Consistency:** Each of the five depth levels has expected scope, specificity, and format. A Level 2 domain theory document is deeper than a Level 5 narrative document. Standards per depth level are defined in the template.

- **Claim-Support-Connect:** The minimum argument structure. Every claim is supported by reasoning. Every reasoning connects to AQLIYA philosophy, doctrine, or first principles. Isolated claims are not theory.

- **Cross-Reference Discipline:** Related documents are referenced by document ID (17.03) not by title ("Recommendation"). Consistent cross-referencing enables automated relation mapping.

- **Section Independence:** Each of the 20 template sections is readable in isolation. Sections may reference related documents but must not depend on earlier sections for context.

## 8. Operational Implications

1. Every author must read 21.01 (this document) and 21.02 (theory document template) before writing or editing any document. Writing standards compliance is not optional.

2. Document reviews include a writing standards check. The reviewer verifies voice consistency, terminology discipline, and section independence before approving.

3. New authors should write one Level 4 definition document as a training exercise before advancing to Level 2 or Level 1 documents. Definitions are the most constrained format and the easiest to standardize.

4. Inconsistencies discovered during review are flagged for correction. Systematic inconsistencies (multiple documents using the wrong term for the same concept) trigger a terminology audit and potential Part 17 update.

5. Writing standards evolve. If a standard proves impractical or produces unclear documents, it is revised through a governed change process, not through individual author deviation.

## 9. Product Implications

1. The product that renders these documents (the theory reference system viewer) should enforce formatting standards: heading levels, table formats, and cross-reference formats.

2. Automated linting of documents against writing standards — checking terminology consistency, cross-reference format, required sections — is a desirable tooling investment.

3. The document template in 21.02 should include embedded guidance for each section, reminding authors of depth level expectations and writing standard requirements.

## 10. Architecture Implications

1. The document storage system (or repository) should support metadata queries by status, depth_level, and owner. Writing standards compliance should be a queryable metadata attribute.

2. Cross-document terminology consistency can be partially automated: a script checks all documents for approved terms and flags deviations.

3. The reference system should support versioned standards: changes to 21.01 should be tracked and authors should know which version of the standards was in effect when they wrote a document.

## 11. Governance Implications

1. Writing standards compliance is a governance requirement for document promotion from Draft to Reviewed. No document may be reviewed without a standards check.

2. Systematic violations — a document that consistently uses incorrect terminology or wrong voice — may be returned to Draft even if the theory content is sound. Standards compliance is separate from theory quality.

3. Changes to writing standards are governed changes. They require documented rationale, review by the founding team, and notification to all document owners.

## 12. AI / Intelligence Implications

1. AI-assisted document generation must follow the same writing standards. Prompts should include the writing standards summary to ensure generated content matches the system voice.

2. AI linting of documents for standards compliance is feasible: voice detection, terminology consistency checking, and cross-reference format validation can be automated.

3. AI should not generate content that uses first-person, marketing language, or informal tone. The standards must be encoded in the generation instructions, not corrected afterward.

## 13. UX Implications

1. Documents are read in a reference system viewer, not in a code editor. The viewer should apply consistent formatting regardless of the raw markdown.

2. Cross-references should be clickable links resolved to document titles and IDs. The viewer should support bidirectional navigation.

3. Depth level indicators should be visible to readers so they know what depth to expect from a document.

## 14. Commercial Implications

1. Writing standards are not visible to customers, but the quality they produce is. Consistent, professional, coherent theory documentation signals intellectual rigor and builds trust.

2. Customers evaluating AQLIYA's philosophy read the foundational thesis documents. Inconsistent writing quality undermines the perception of intellectual coherence.

3. Partners and implementers rely on clear, consistent theory documentation to understand product direction, governance requirements, and integration patterns. Standards enable partner success.

## 15. Anti-Patterns

1. **Academic voice.** Writing like a research paper. Passive voice, third-person formal, hedged claims, extensive citations. The AQLIYA voice is authoritative and direct, not academic.

2. **Marketing voice.** Writing like a sales page. Superlatives, claims without support, benefit statements without mechanism. Theory documents explain how and why, not just that something is good.

3. **Engineering voice.** Writing like technical documentation. Over-specification, implementation detail, code-level description. Theory documents explain principles and structures, not implementations.

4. **Synonym variety.** Using different terms for the same concept to avoid repetition. "Decision record," "decision artifact," "decision entity" for what should always be "decision object." Terminology consistency is sacrificed for prose variety.

5. **Section dependency.** Writing section 3 that assumes the reader has read section 2. Each section must stand alone. Brief contextual restatement is acceptable.

6. **Hedging.** "This may suggest that..." "It could be argued that..." "One possible interpretation is..." The AQLIYA voice states positions clearly. Uncertainty is signaled explicitly through confidence levels, not through linguistic hedging.

## 16. Examples

**Example 1: Correct Voice.** "AQLIYA treats operational signals as workflow intelligence. Operational signals are produced by analyzing workflow state, evidence collection progress, and reviewer capacity — not by static rules. They are distinct from risk signals: risk signals concern professional quality; operational signals concern execution effectiveness." (From 17.08)

**Example 2: Incorrect Voice — Academic.** "It could be proposed that operational signals might be conceptualized as a form of workflow-related intelligence that is generated through the analytical processing of workflow state variables, evidence collection metrics, and reviewer capacity indicators."

**Example 3: Incorrect Voice — Marketing.** "AQLIYA's revolutionary operational signal technology transforms how you manage engagements. Say goodbye to manual bottlenecks and hello to intelligent workflow automation."

## 17. Enterprise Impact

1. **Intellectual coherence.** Consistent writing standards ensure that the theoretical reference system reads as a single coherent work, building trust in the intellectual foundation.

2. **Author productivity.** Clear standards reduce decision fatigue for authors. They know what voice to use, what depth to target, and what format to follow — without reinventing these decisions for each document.

3. **Review efficiency.** Standards-compliant documents require fewer revision cycles. The reviewer focuses on theory quality, not on fixing voice, terminology, or formatting.

4. **Scalability.** As the system grows to hundreds of documents, writing standards prevent the decay into inconsistency that afflicts unstandardized documentation systems.

5. **Onboarding.** New team members can learn the standards and produce compliant documents quickly. Standards transfer faster than intuition.

## 18. Long-Term Strategic Importance

Writing standards are the quality control mechanism for the theoretical reference system. Without them, the system decays. With them, the system scales. As the system grows from 21 parts to more, from dozens of documents to hundreds, the standards are what preserve coherence. They are not a constraint on authors — they are the condition that makes the system maintainable.

Long-term, writing standards become part of AQLIYA's knowledge management brand. The theoretical reference system is the public face of AQLIYA's intellectual rigor. Every document that a customer, partner, or analyst reads must demonstrate that rigor through consistent, professional, coherent writing.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.01 | 00-document-template.md | The structural template these standards fill |
| 00.02 | 00-governance-rules.md | Governance rules that these standards serve |
| 21.02 | Theory Document Template | The practical template with embedded writing guidance |
| 21.04 | Versioning Rules | How document versions relate to standards versions |
| 21.10 | Documentation Quality Checklist | Quality checklist that includes standards compliance |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
