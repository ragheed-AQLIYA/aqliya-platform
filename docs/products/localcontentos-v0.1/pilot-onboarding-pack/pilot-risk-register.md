# Pilot Risk Register — LocalContentOS v0.1

## Risk Table

| #    | Risk                                                            | Impact                                             | Likelihood | Mitigation                                                                                                       | Owner                 |
| ---- | --------------------------------------------------------------- | -------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- |
| R-01 | Customer cannot provide supplier data with CR numbers           | Supplier register incomplete                       | Medium     | Accept anonymized data; AQLIYA can generate sample data for demonstration                                        | Customer sponsor      |
| R-02 | Spend records are incomplete or outdated                        | Classification accuracy affected                   | Medium     | Use best-available data; clearly label estimates; document assumptions                                           | Procurement owner     |
| R-03 | Customer has unclear local/non-local classification rules       | Classification may not match customer expectations | High       | Discuss classification rules in kickoff; offer default AQLIYA classification logic; document deviations          | LC/compliance owner   |
| R-04 | Customer expects regulatory certification                       | Trust damage, scope mismatch                       | High       | Explicitly state "not certified compliance" in demo and kickoff; include non-certification notice in all exports | AQLIYA pilot lead     |
| R-05 | Customer expects regulator-certified PDF/XLSX or perfect Arabic PDF | Misunderstanding that export equals official compliance | Medium     | Demo binary PDF/XLSX in reports; emphasize disclaimer and non-certification; note Arabic font P2 quality gap | AQLIYA pilot lead     |
| R-06 | Customer expects AI to classify suppliers automatically         | Expectation mismatch                               | Medium     | State clearly: all classification is human-driven; AI is not wired in this version                               | AQLIYA pilot lead     |
| R-07 | Evidence files are too large or wrong format                    | Upload fails                                       | Low        | Document supported formats and size limits (10MB max) in data request                                            | AQLIYA technical lead |
| R-08 | Browser compatibility issues                                    | Customer cannot access workspace                   | Low        | Confirm browser (modern Chrome/Edge) in kickoff; test customer environment before demo                           | AQLIYA technical lead |
| R-09 | User account setup delays                                       | Timeline slips                                     | Low        | Create accounts within 2 days of receiving user details; test login before demo                                  | AQLIYA technical lead |
| R-10 | Customer loses interest after demo                              | Pilot stalls, no data provided                     | Medium     | Schedule follow-up immediately after demo; send data request with clear deadline; keep momentum                  | AQLIYA pilot lead     |
| R-11 | Customer internal politics or stakeholder change                | Pilot delayed or cancelled                         | Low        | Identify decision-maker early; keep sponsor engaged throughout                                                   | Customer sponsor      |
| R-12 | Platform audit trail or authentication issue found during pilot | Workflow blocked                                   | Low        | Pre-pilot smoke test completed (32/45 PASS); remaining mutation items are form fills, not auth critical path     | AQLIYA technical lead |

## Risk Response Plan

| Trigger                                         | Response                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Customer asks about regulatory certification    | Immediately clarify: "This is an assessment workspace, not a certified compliance system." Reference limitations document. |
| Data not delivered within 1 week                | AQLIYA pilot lead follows up; if still not delivered within 2 weeks, propose using demo data for remainder of pilot        |
| Customer technical issue during demo            | AQLIYA technical lead troubleshoots live; if unresolvable, reschedule and prepare pre-tested environment                   |
| Customer expresses interest in excluded feature | Document as enhancement request; explain roadmap if available; do not claim it is implemented                              |
