# AQLIYA Runbooks

Operational guides for managing the AQLIYA platform.

## Table of Contents

| Runbook | Description |
|---------|-------------|
| [Alerting](alerting.md) | Alert definitions, severity levels, response procedures, escalation matrix |
| [Monitoring](monitoring.md) | Monitoring tools, health endpoints, key metrics, dashboard instructions |
| [Staging Environment](staging-environment.md) | Local staging setup, CI deployment, verification, and seeding |
| [Rate Limiter](rate-limiter.md) | Rate limit configuration, presets, Redis fallback, incident response |

## How to Use

Each runbook is self-contained and covers a specific operational area. Runbooks assume the reader has:

- Access to the AQLIYA repository
- Docker and Node.js installed
- Appropriate AWS/cloud credentials for remote operations
- Familiarity with basic CLI usage

## Adding a New Runbook

1. Create a new markdown file in this directory.
2. Add an entry to the table above.
3. Follow the existing structure conventions.

## Runbook Index

- **Alerting** — For on-call engineers responding to alerts. Start here when paged.
- **Monitoring** — For engineers checking platform health. Run health checks from here.
- **Staging Environment** — For DevOps managing deployments. Covers CI/CD and staging setup.
- **Rate Limiter** — For engineers troubleshooting 429 errors or Redis issues.
