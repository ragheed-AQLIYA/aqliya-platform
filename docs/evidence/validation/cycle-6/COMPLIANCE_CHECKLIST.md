# Compliance Checklist (lightweight)

| Control | Evidence | Gap |
| ------- | -------- | --- |
| Access control | RBAC + server-action-guard tests | ADMIN cross-tenant accepted risk |
| Audit logging | PlatformAuditEvent, AuditEvent | SIEM export N/A |
| Change management | CI on `main`, deploy workflows | Terraform apply N/A |
| Backup | `backup.yml`, scripts | Restore drill N/A |
| AI governance | Human review, bridge audit action | Live staging proof N/A |
| Encryption | TLS (deploy assumption), vault AES-GCM | KMS N/A |

**Verdict:** Suitable for **pilot** with conditions; not **L6 certified**.
