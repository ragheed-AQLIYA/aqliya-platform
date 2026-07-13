# AEOS Agent Registry

**Status:** Active  
**Version:** 1.1  
**Owner:** Agent Engine (kernel)  

## Registry Format (YAML)

```yaml
id: <unique-agent-id>
name: <human-readable-name>
layer: <layer-number>
version: <semver>
owner: <team-or-division>
priority: critical | high | medium | low
status: active | idle | running | archived

skills:
  - <skill-id>
  - <skill-id>

dependencies:
  - <agent-id>

permissions:
  - read
  - propose
  - modify-docs
  - create-pr
  - modify-src

description: |
  <what the agent does>

metrics:
  success_rate: <percentage>
  tasks_completed: <count>
  avg_completion_time_ms: <ms>
  last_active: <ISO timestamp>
```
