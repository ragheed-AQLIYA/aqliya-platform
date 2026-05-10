# AQLIYA Theoretical Reference System — Governance Rules

These rules govern the creation, maintenance, and deprecation of all documents within the AQLIYA Theoretical Reference System.

## Rule 1: Document ID

Every document must have a unique ID in the format `XX.YY` where `XX` is the part number and `YY` is the document number within that part.

## Rule 2: Part Belonging

Every document must belong to one of the 21 parts defined in the master index. No document exists outside this structure.

## Rule 3: No Random Documents

No theoretical document may be created outside the master index. Any new theory must either fit within an existing part or justify creation of a new part (requiring index update).

## Rule 4: Terminology Discipline

New terms introduced in any document must be added to Part 17 (Terminology & Definitions) before or concurrently with the document. No term may exist in only one document.

## Rule 5: Connectivity Requirement

Every theory must explicitly connect to at least one of:
- Product design or roadmap
- System architecture or technical design
- Governance policy or compliance framework
- Market narrative or go-to-market strategy

A theory that connects to none of these must be deferred or deleted.

## Rule 6: Major Update Logging

Every major update to a document (beyond typo fixes) must be recorded in the Version History section. Major updates include:
- Changing a thesis or principle
- Adding new sections
- Reversing a previous position
- Deprecating a concept

## Rule 7: Document Status

Every document must have a clearly defined status:
- **Not Started**: Listed in index only, no content written
- **Draft**: Initial writing complete, not yet reviewed
- **Reviewed**: Logically and conceptually reviewed
- **Approved**: Accepted as reference
- **Active Reference**: Currently used in product, architecture, or narrative
- **Needs Revision**: Requires update due to strategic change or new learning
- **Deprecated**: No longer approved, must not be referenced as current position

## Rule 8: Relevance Filter

Any theoretical document that does not demonstrably affect product, architecture, governance, AI, UX, or commercialization must be deleted from the index or deferred to a future phase.

## Rule 9: Template Compliance

Every document must use the standard template defined in `00-document-template.md`. No document may omit more than 3 sections without justification.

## Rule 10: Anti-Pattern Documentation

Every domain theory document should reference relevant anti-patterns from Part 18, and every anti-pattern document should reference the theories it violates.

## Enforcement

The master index is the source of truth. Any document not in the index does not exist as AQLIYA theory. Any document in the index without an owner or status is considered incomplete.
