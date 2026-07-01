# Governance Traceability Framework

## Governance rules and their system traces

### Rule: Every state transition must be authorised

- **Enforced By:** Workflow engine gate nodes; transition validation middleware
- **Evidence Artifact:** Signed transition record comprising source state, target state, authorising actor, and timestamp
- **Audit Trail:** Event store sequence keyed by (workflow_id, transition_number); immutable append-only log

### Rule: Human approval must be distinct from AI recommendation

- **Enforced By:** Approval queue service; separate actor fields in evidence schema
- **Evidence Artifact:** Approval record with `approved_by` (human) and `recommended_by` (AI or human) as distinct attributes
- **Audit Trail:** Linked pair of events — recommendation event followed by approval event — with causal trace via `in_response_to` reference

### Rule: Evidence must be attached before mutation commits

- **Enforced By:** Transaction middleware; evidence attachment precondition in write path
- **Evidence Artifact:** Evidence bundle checksum stored alongside the mutation record; full bundle referenced by content-addressable hash
- **Audit Trail:** Mutation record in event store linked to evidence hash; integrity verifiable via re-computation

### Rule: Governance gates must be structurally enforced

- **Enforced By:** Workflow graph definition; graph compiler rejects cycles and missing gates
- **Evidence Artifact:** Compiled workflow graph manifest with gate node signatures
- **Audit Trail:** Versioned graph manifests stored alongside workflow execution logs; any graph change produces a new manifest version

### Rule: Dashboards must not be write paths

- **Enforced By:** Read-only query layer; reverse proxy rejects write verbs on dashboard endpoints
- **Evidence Artifact:** CORS and method-allow configuration; HTTP 405 response log for rejected write attempts
- **Audit Trail:** Access logs for dashboard endpoints; any mutation request is logged as a security event

### Rule: All binding actions require two-person rule (4-eyes)

- **Enforced By:** Workflow gate requiring two distinct human approvals before final transition
- **Evidence Artifact:** Dual-approval record with both actor identities and independent timestamps
- **Audit Trail:** Two sequential approval events in the event store; system enforces that the two actors differ
