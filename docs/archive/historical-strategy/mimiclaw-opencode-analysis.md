> **Historical — not authoritative.** Toolchain decision evidence; mimiclaw rejected for Phase 1 per `AGENTS.md` §36.

---

# Mimiclaw → AQLIYA OpenCode Analysis

> **Status:** Evidence report. Not doctrine.  
> **Date:** 2026-05-27  
> **Source:** https://github.com/memovai/mimiclaw

---

## What Was Inspected

| File                                | Purpose                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `README.md`                         | Project overview, features, quick start, memory system, tools                    |
| `docs/ARCHITECTURE.md`              | System design, module map, FreeRTOS task layout, agent loop, data flow           |
| `docs/TODO.md`                      | Feature gap tracker vs nanobot reference (skills, memory-write, cron, heartbeat) |
| `CONTRIBUTING.md`                   | Contribution scope, development setup, PR guidelines                             |
| `skills/deploy/SKILL.md`            | Deployment skill — frontmatter format + full end-to-end guide                    |
| `skills/deploy/scripts/deploy.sh`   | Build-flash-verify automation script                                             |
| `skills/deploy/scripts/validate.sh` | Pre-deployment validation (prerequisites → secrets → hardware)                   |

---

## 1. What Is Useful for AQLIYA

### 1.1 Skill System Format (SKILL.md)

Mimiclaw/nanobot uses a skill system where each skill is a markdown file with YAML frontmatter:

```yaml
---
name: deploy
description: Deploy MimiClaw firmware to an ESP32-S3 board.
---
```

This is directly applicable. AQLIYA should standardize on this exact format for `.skills/aqliya/` files. The frontmatter enables OpenCode to auto-select the right skill based on task description matching.

### 1.2 Deployment Validation Pattern (validate.sh)

The validate.sh script follows a clean staged validation:

1. **Prerequisites check** (toolchain available)
2. **Project files check** (config files exist)
3. **Secrets check** (credentials configured)
4. **Hardware check** (serial port detected)

AQLIYA equivalent: pre-flight validation before any task that checks auth state, route coherence, docs authority, etc.

### 1.3 Agent Loop Architecture

The ReAct pattern (Context Builder → LLM call → Tool execution → Repeat) is clean. AQLIYA already follows this implicitly via OpenCode. The value is in **documenting** the loop explicitly so agents can self-correct.

### 1.4 File-Based Memory Hierarchy

Mimiclaw uses:

- `SOUL.md` — identity/personality
- `USER.md` — user profile
- `MEMORY.md` — long-term memory
- `HEARTBEAT.md` — task list / proactive checks
- `YYYY-MM-DD.md` — daily notes
- `tg_*.jsonl` — session history

AQLIYA already uses `AGENTS.md` as the master contract. The hierarchy concept (identity → user → memory → tasks → sessions) is valuable for structuring OpenCode context files.

### 1.5 Tool Registry Pattern

Tool registration with name, description, JSON input_schema, and dispatch-by-name. This maps to how OpenCode uses tool declarations. AQLIYA should document its tool-use discipline the same way.

### 1.6 Two-Layer Configuration

Build-time defaults + runtime overrides. AQLIYA already has `.env` + runtime config. The pattern is documented for agent clarity.

### 1.7 Skill Selection by Task Matching

The SKILL.md frontmatter enables automatic skill selection. OpenCode can match `description` against task keywords to load the right `.skills/aqliya/*.md` file.

### 1.8 Heartbeat / Proactive Task Model

HEARTBEAT.md periodically checked for uncompleted tasks. AQLIYA can use this concept for its agent operating contract — periodic review of AGENTS.md for pending completion items.

---

## 2. What Is NOT Appropriate for AQLIYA

| Mimiclaw Feature              | Why Not Appropriate                         |
| ----------------------------- | ------------------------------------------- |
| ESP32-S3 C firmware           | AQLIYA is a Next.js/TypeScript web platform |
| FreeRTOS task model           | AQLIYA uses serverless/Node.js runtime      |
| Telegram bot integration      | AQLIYA is web-first, not chat-bot-first     |
| SPIFFS flat filesystem        | AQLIYA uses PostgreSQL + Prisma             |
| OTA firmware updates          | Irrelevant for web platform                 |
| UART/COM port console         | No hardware interfacing                     |
| PSRAM/SRAM budget             | No embedded memory constraints              |
| Claude/Anthropic specific API | AQLIYA AI abstraction is provider-agnostic  |
| WebSocket gateway :18789      | AQLIYA uses Next.js API routes              |
| HTTP CONNECT proxy tunnels    | Not relevant for web app architecture       |
| Shell scripts (bash)          | AQLIYA needs PowerShell/JS alternatives     |

---

## 3. What Can Be Converted to Skills

| Mimiclaw Concept  | AQLIYA Skill File             | Purpose                            |
| ----------------- | ----------------------------- | ---------------------------------- |
| SKILL.md format   | `.skills/aqliya/*.md`         | Standardized skill definitions     |
| validate.sh       | `aqliya-low-load-dev.md`      | Pre-flight validation protocol     |
| deploy.sh         | `aqliya-release-checklist.md` | Deployment/release procedure       |
| AGENTS.md/SOUL.md | `aqliya-opencode-agent.md`    | Agent identity and operating rules |
| Tool registry     | Built into skill selection    | Tool-use discipline per skill      |
| Config discipline | `aqliya-security-gate.md`     | Auth/config validation             |
| Memory hierarchy  | `aqliya-docs-authority.md`    | Documentation source-of-truth      |
| Heartbeat         | Built into AGENTS.md          | Periodic completion checks         |
| Skill selection   | Built into AGENTS.md          | Task→skill matching rules          |

---

## 4. What Can Be Converted to OpenCode Rules

| Concept               | Rule                                             |
| --------------------- | ------------------------------------------------ |
| Skill auto-load       | When task matches skill description → load skill |
| Pre-flight validation | Before any mutation, run context/discover step   |
| Two-layer config      | `.env` as defaults, runtime DB as override       |
| No silent changes     | Every mutation must log + document               |
| Deployment checklist  | Never deploy without pre-flight + security gate  |

---

## 5. What Must NOT Be Merged

- **No mimiclaw C code** — do not copy any source code
- **No ESP32/Telegram/hardware concepts** — do not introduce into AQLIYA architecture docs
- **No shell/bash scripts** — AQLIYA uses Windows/PowerShell environment
- **No Claude-specific patterns** — AQLIYA AI abstraction must remain provider-agnostic

---

## 6. Key Differences to Preserve

| Dimension      | Mimiclaw               | AQLIYA                        |
| -------------- | ---------------------- | ----------------------------- |
| Runtime        | Bare metal C on ESP32  | Next.js/Node.js on server     |
| Storage        | SPIFFS flat files      | PostgreSQL via Prisma         |
| User interface | Telegram chat          | Web dashboard                 |
| Memory         | Flat markdown files    | Structured DB + audit logs    |
| AI provider    | Hardcoded Anthropic    | Provider-agnostic abstraction |
| OS             | FreeRTOS               | Linux/Cloud                   |
| Skills         | SPIFFS-stored SKILL.md | `.skills/` directory          |

---

## 7. Recommended Adoption Path

1. **Create `.skills/aqliya/`** with 7 skill files using mimiclaw's SKILL.md frontmatter format
2. **Add skill selection rules** to `AGENTS.md` — auto-load skill when task description matches
3. **Adopt validate.sh pattern** as `aqliya-low-load-dev.md` — staged pre-flight checks
4. **Use mimiclaw's memory hierarchy** as conceptual model for OpenCode context management
5. **Adopt two-layer config** documentation for agent clarity
6. **Do not copy code** — only patterns, formats, and protocols

---

## 8. Format Template Derived from Mimiclaw

```yaml
---
name: <skill-name>
description: <one-line description for auto-matching>
---
```

Each `.skills/aqliya/*.md` follows this exact format so OpenCode can:

1. Match task description against skill `description`
2. Load skill content when confidence threshold is met
3. Apply skill rules as constraints during execution
