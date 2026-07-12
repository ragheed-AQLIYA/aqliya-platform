# AQLIYA Runbooks

Operational guides for managing the AQLIYA platform.

> **Canonical operations docs:** Detailed procedures also live under [`docs/operations/`](../docs/operations/). Prefer `docs/operations/backup-restore-procedure.md` for script-level backup steps; this folder holds operator quick-reference runbooks.

## Table of Contents

| Runbook | Description |
|---------|-------------|
| [Alerting](alerting.md) | Alert definitions, severity levels, response procedures, escalation matrix |
| [Backup & Restore](backup-restore.md) | Backup strategy, manual backup, restore drills (see also `docs/operations/backup-restore-procedure.md`) |
| [ClamAV Scanner](clamav-scanner.md) | ClamAV file scanning operations, sidecar configuration, troubleshooting |
| [Deployment](deployment.md) | CI/CD pipeline, ECS deployment, rollback procedures, IaC |
| [Disaster Recovery](disaster-recovery.md) | DR procedures, RTO/RPO targets, recovery workflows |
| [Monitoring](monitoring.md) | Monitoring tools, health endpoints, key metrics, dashboard instructions |
| [Rate Limiter](rate-limiter.md) | Rate limit configuration, presets, Redis fallback, incident response |
| [Redis Operations](redis-operations.md) | Redis client, cache adapter, rate limiter Redis backend, recovery procedures |
| [Security Incident](security-incident.md) | Security incident detection, response, and recovery procedures |
| [Staging Environment](staging-environment.md) | Local staging setup, CI deployment, verification, and seeding |

## How to Use

Each runbook is self-contained and covers a specific operational area. Runbooks assume the reader has:

- Access to the AQLIYA repository
- Docker and Node.js installed
- Appropriate AWS/cloud credentials for remote operations
- Familiarity with basic CLI usage

## Runbook Index by Role

- **On-Call Engineer** — Start with [Alerting](alerting.md) when paged. Check [Monitoring](monitoring.md) for health status.
- **DevOps / SRE** — Use [Deployment](deployment.md) for CI/CD and rollbacks. Use [Redis Operations](redis-operations.md) for cache/rate limiter issues.
- **Security Engineer** — Start with [Security Incident](security-incident.md) for incident response. Check [ClamAV Scanner](clamav-scanner.md) for file scan issues.
- **Platform Engineer** — Use [Staging Environment](staging-environment.md) for local setup. Check [Disaster Recovery](disaster-recovery.md) for DR procedures.
- **Data Engineer** — Use [Backup & Restore](backup-restore.md) for database operations.

## Runbook Index by System

| System | Runbook |
|--------|---------|
| **CI/CD** | [Deployment](deployment.md), [Staging Environment](staging-environment.md) |
| **Infrastructure** | [Deployment](deployment.md), [Disaster Recovery](disaster-recovery.md) |
| **Security** | [Security Incident](security-incident.md), [ClamAV Scanner](clamav-scanner.md), [Rate Limiter](rate-limiter.md) |
| **Caching** | [Redis Operations](redis-operations.md), [Rate Limiter](rate-limiter.md) |
| **Monitoring** | [Monitoring](monitoring.md), [Alerting](alerting.md) |
| **Data** | [Backup & Restore](backup-restore.md), [Disaster Recovery](disaster-recovery.md) |

## Adding a New Runbook

1. Create a new markdown file in this directory.
2. Add an entry to the table above.
3. Add a brief description to the appropriate section below.
4. Follow the existing structure conventions (Overview, Configuration, Troubleshooting, Reference, Change Log).
