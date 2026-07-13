# AEOS Skill Registry

**Status:** Active  
**Version:** 1.1  

## Registry Format (YAML)

```yaml
id: <unique-skill-id>
name: <human-readable-name>
version: <semver>
status: draft | review | active | deprecated | retired
owner: <layer-or-agent>
layer: <layer-number>

inputs:
  - <what-the-skill-needs>
outputs:
  - <what-the-skill-produces>

compatible_agents:
  - <agent-id>

dependencies:
  - <skill-id or agent-id>

quality_score: 0-100
success_rate: <percentage>
times_used: <count>
last_used: <ISO timestamp>
avg_execution_time_ms: <ms>

tests: <boolean>
description: |
  <what the skill does>
```
