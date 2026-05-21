# Limited Production Pilot — Risk Acceptance Form

## Pilot Scope

**Product:** AuditOS  
**Pilot Type:** Limited production pilot  
**Environment:** Controlled — approved pilot clients only  
**Duration:** [TBD — suggested 4–8 weeks]

---

## Acknowledged Limitations

By signing this form, the stakeholder acknowledges the following limitations:

### 1. Export Format

Export output is **JSON only**. PDF and Word documents are not yet available.

☐ I acknowledge that report outputs will be in JSON format and cannot be rendered as styled PDF or Word documents directly from the application.

### 2. File Scanning

File uploads are **not scanned for malware** unless a scanner provider (`SCANNER_PROVIDER`) is configured. Without a configured scanner, production uploads are blocked.

☐ I acknowledge that real client files must not be uploaded unless a virus/malware scanner is configured and verified.

### 3. Backup

Database backups are **manual**. Automated backup scheduling is not yet deployed.

☐ I acknowledge that backups must be performed manually per the runbook procedure.

### 4. Authentication

Authentication uses **email/password** (Credentials provider). SSO/OAuth is not yet configured.

☐ I acknowledge that authentication relies on email/password credentials.

### 5. Export Limitations

Only **JSON exports** are available. PDF/DOCX exports are deferred.

☐ I acknowledge the JSON-only export limitation.

### 6. Pilot Scope

This is a **limited production pilot**, not a full external production deployment.

☐ I acknowledge that this is a limited production pilot with documented restrictions.

---

## Data Boundaries

| Item                                            | Allowed | Not Allowed |
| ----------------------------------------------- | ------- | ----------- |
| Synthetic/anonymized audit data                 | ✅      |             |
| Real client trial balance data                  | ✅      |             |
| Real client financial statements                | ✅      |             |
| Real client personally identifiable information |         | ❌          |
| Real client sensitive commercial data           |         | ❌          |
| Uploaded unverified files                       |         | ❌          |
| Production-critical infrastructure data         |         | ❌          |

☐ I acknowledge the data boundaries above.

---

## Sign-Off

| Role                               | Name | Signature | Date |
| ---------------------------------- | ---- | --------- | ---- |
| Pilot Sponsor                      |      |           |      |
| AQLIYA Product Lead                |      |           |      |
| Client Stakeholder (if applicable) |      |           |      |

---

## Agreement

I have read, understood, and accept the limitations, risks, and data boundaries described in this document. I acknowledge that AuditOS is in limited production pilot and is not yet a full external production system.

**Signed:** ********\_\_******** **Date:** ********\_\_********

---

## Counter-Signature (AQLIYA)

I confirm that the pilot environment has been configured according to the Pilot Environment Checklist and that the documented limitations have been communicated.

**Name:** ********\_\_******** **Date:** ********\_\_********
