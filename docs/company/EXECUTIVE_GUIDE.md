# AQLIYA Executive Guide

**適用對象:** CEO, Board, Investors  
**Status:** Active | Version 1.0 | 2026-06-30

## What AQLIYA Is

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

Arabic: عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.

## Trust Principle

> **AI assists. Humans decide. Evidence governs.**
> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

## Platform Identity

AQLIYA IS:
- A Private Governed Institutional Intelligence Platform
- A multi-product company (AuditOS, LocalContentOS, DecisionOS, etc.)
- A cloud-deployed platform (AWS ECS/RDS/Redis)
- Governance-first, evidence-based, human-reviewed

AQLIYA IS NOT:
- SaaS only (strategic Private/On-Prem direction)
- An AI chatbot
- AuditOS only (AQLIYA = platform, AuditOS = product on it)

## Deployment Models

| Model | Status |
|-------|--------|
| AQLIYA Cloud (AWS me-south-1) | ✅ Implemented |
| AQLIYA Private / On-Prem | 📋 Strategic / Future |
| AQLIYA Air-Gapped | 📋 Strategic / Future |

## Product Portfolio

| Product | Status | Readiness |
|---------|--------|-----------|
| AuditOS | L5 Pilot-ready | ✅ Strong |
| LocalContentOS | L5 Pilot-ready | ✅ Strong |
| DecisionOS | L5 Pilot-ready | ✅ Strong |
| WorkflowOS | L5 Pilot-ready | ✅ Strong |
| SalesOS | L5 Pilot-ready (internal) | ⚠️ Architecture debt |
| LocalContactOS | L5 Pilot-ready | ⚠️ No tests |
| Office AI Assistant | L5 Pilot-ready | ✅ Strong |
| RiskOS | L5 (AuditOS-adjacent) | ⚠️ No evidence model |
| Institutional Memory | L5 Pilot-ready | ⚠️ No tests |
| ContentStudio | L4 Usable | ✅ Matches level |

## Current Status
- **Engineering:** 96% (TypeScript 0, Lint 0, Build passes)
- **Tests:** 3740+ passing, 21 intentionally skipped
- **Documentation:** 35 directories, 10 product reference files
- **Overall Readiness:** 74/100 (Pilot-capable)

## Architecture
`
AQLIYA Platform Company
├── AQLIYA Intelligence Core (12 engines)
├── Shared Applications (Office AI Assistant)
├── Specialized Operating Systems (AuditOS, DecisionOS, etc.)
├── Custom Workspaces (WorkflowOS)
└── Proof Center (/proof, /demo)
`

## What We Do NOT Claim
- L6 Production-hardened
- Enterprise-ready SaaS
- On-Prem / Air-Gapped deployment packages
- Autonomous AI decisions
- SOC2 certification (on roadmap)

## Next Strategic Priorities
1. Staging DNS resolution [+infra blocker]
2. AWS live access for restore drill
3. Penetration testing
4. L6 hardening for AuditOS, LocalContentOS, DecisionOS
5. SalesOS architecture unification
