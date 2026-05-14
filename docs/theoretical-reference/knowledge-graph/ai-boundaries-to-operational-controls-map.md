# AI Boundaries to Operational Controls Map

Maps AI boundary doctrine to operational controls.

| AI Boundary | Doctrine Source | Operational Control | Violation Risk |
|---|---|---|---|
| AI must never make final approval decisions | Part 10 (Human + AI) | Workflow gate rejects transitions where AI is the sole approver | Unauthorized automated sign-off, loss of human accountability |
| AI recommendations must be overrideable without friction | Part 10 (Human + AI), Part 18 (Anti-Patterns) | UI provides one-click override with mandatory rationale field | Reviewer bypasses override due to friction, rubber-stamps AI output |
| AI scope must be explicitly bounded per engagement | Part 15 (Responsible Intelligence) | Engagement configuration restricts AI to specified accounts and procedures | AI operates outside intended scope, introduces undocumented bias |
| AI must not fabricate or hallucinate evidence | Part 18 (Anti-Patterns), Part 15 (Responsible Intelligence) | Every AI-sourced output links to verifiable source; hallucination detector monitors confidence | False evidence enters audit trail, undermines opinion integrity |
| AI must disclose confidence and uncertainty | Part 15 (Responsible Intelligence) | AI recommendation payload includes confidence score and uncertainty range | Over-reliance on low-confidence recommendations without human scrutiny |
| Human-in-the-loop must be genuine, not perfunctory | Part 10 (Human + AI), Part 18 (Anti-Patterns) | System tracks time-to-approve and flags abnormally fast reviews | Reviewers approve without genuine assessment, creating liability |
| AI must not learn from or propagate client confidential data | Part 15 (Responsible Intelligence), Part 08 (Governance & Trust) | AI model isolation per engagement; no cross-engagement training | Data leakage between clients, regulatory and contractual breach |
| Audit trails must record human vs. AI actions distinctly | Part 10 (Human + AI), Part 09 (Data Trust) | Every audit log entry includes `actor_type: human | AI` field | Inability to distinguish automated vs. human actions in dispute resolution |
| AI suggestions must cite methodology or rule used | Part 15 (Responsible Intelligence) | Recommendation card shows applicable rule reference or calculation basis | Recommendations accepted without methodological scrutiny |
| Boundary violations must trigger escalation, not silent fallback | Part 15 (Responsible Intelligence), Part 18 (Anti-Patterns) | Monitoring alerts on boundary breach; workflow pauses until human resolves | AI silently degrades or operates outside governance without detection |
