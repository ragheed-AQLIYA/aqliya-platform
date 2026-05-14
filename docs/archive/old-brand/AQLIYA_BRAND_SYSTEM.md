# AQLIYA Brand System

**Version:** 1.0  
**Date:** May 2026  
**Owner:** Brand Team

---

## Company Identity

| Attribute | Value |
|-----------|-------|
| **Company Name** | AQLIYA (عقلية) |
| **Name (Arabic)** | عقلية |
| **Positioning** | Enterprise Systems Builder — شركة أنظمة مؤسسية متعددة المجالات |
| **Tagline** | "Mind The Future" |
| **Entity Type** | شركة أنظمة مؤسسية (Enterprise Systems Company) |
| **What We Do** | Build and configure software systems and enterprise intelligence solutions around how organizations actually work |

## Official Systems

| System | Type | Workspace | Demo | Status |
|--------|------|-----------|------|--------|
| AuditOS | System + Workspace | `/audit` | `/auditos` | **Active primary product** |
| DecisionOS | System + Workspace | `/decisions` | — | **Active adjacent workspace** |
| SalesOS | Prototype | `/sales` | — | Prototype dashboard |
| SimulationOS | Marketing-only | — | — | Marketing page only |
| Local Content OS | Marketing-only | — | — | Marketing page only |

## Brand Colors (Runtime Source)

Source of truth: `src/app/globals.css` — CSS custom properties.

| Token | HEX | Usage |
|-------|-----|-------|
| `--aqliya-deep` | `#0A0F24` | Deep brand background, hero sections |
| `--aqliya-indigo` | `#1E3A8A` | Module accent (AuditOS), secondary CTAs |
| `--aqliya-blue` | `#2563EB` | Primary buttons, links, primary CTAs |
| `--aqliya-cyan` | `#0EA5E9` | AI indicators, module accent (SalesOS) |
| `--module-audit` | `#1E3A8A` | AuditOS module accent |
| `--module-sales` | `#0EA5E9` | SalesOS module accent |
| `--module-decision` | `#2563EB` | DecisionOS module accent |
| `--status-success` | `#10B981` | Success states, verified |
| `--status-warning` | `#F59E0B` | Warnings, pending |
| `--status-error` | `#EF4444` | Errors, critical |
| `--status-info` | `#8B5CF6` | Info, AI insights |

## Brand Assets Location

| Asset | Path | Type |
|-------|------|------|
| Approved logo (PNG) | `public/brand/aqliya-logo-approved.png` | Primary logo |
| Favicon | `public/brand/Favicons/symbol (1).svg` | Icon |
| Full icon (SVG) | `public/brand/Favicons/AQLIYA_Icon_Full_EdgeToEdge.svg` | Full icon |
| Full icon (PNG) | `public/brand/Favicons/aqliya_icon_full.png` | Full icon PNG |
| Logos (PNG) | `public/brand/png/` | 4 variants (color/black/white with/without bg) |
| Logos (PDF) | `public/brand/pdf/` | 4 variants (color/black/white with/without bg) |

## Brand Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Full visual identity system | `docs/brand/AQLIYA-VISUAL-IDENTITY-SYSTEM.md` | Complete brand guide |
| Quick reference | `docs/brand/QUICK-REFERENCE.md` | Colors, typography, spacing cheat sheet |
| Brand assets organization | `docs/brand/BRAND-ASSETS-ORGANIZATION.md` | File structure guide |
| Component library | `docs/brand/COMPONENT-LIBRARY.md` | UI component guide |
| Dashboard density governance | `docs/brand/DASHBOARD-DENSITY-GOVERNANCE.md` | Spacing and hierarchy rules |
| UI copy guide | `docs/brand/AQLIYA_UI_COPY_GUIDE.md` | Copy consistency rules |
| Visual QA checklist | `docs/brand/AQLIYA_VISUAL_QA_CHECKLIST.md` | QA standards |
| Implementation report | `docs/archive/brand/IMPLEMENTATION-REPORT.md` | Previous transformation report |
| Enterprise interaction report | `docs/archive/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md` | Interaction system report |
| Intelligence architecture report | `docs/archive/brand/ENTERPRISE-INTELLIGENCE-ARCHITECTURE-REPORT.md` | Intelligence layer report |

## Naming Conventions

### In UI Labels
- Use **"AQLIYA"** (uppercase, always)
- Use **"عقلية"** for Arabic contexts
- Product names: **"AuditOS"**, **"DecisionOS"**, **"SalesOS"**
- Do NOT use: "عقلية أوديت", "Fin Intelligence", "Aqliya" (lowercase), generic product names without AQLIYA prefix

### In Marketing Pages
- Company: **"AQLIYA"** or **"عقلية"**
- Products: use descriptive Arabic with English system name
  - **"AuditOS — نظام المراجعة والتدقيق"**
  - **"أنظمة اتخاذ القرار"** (DecisionOS)
  - **"أنظمة المبيعات"** (SalesOS)
  - **"أنظمة المحاكاة"** (SimulationOS — marketing only)
  - **"أنظمة المحتوى المحلي"** (Local Content OS — marketing only)

## Product Status Labels

| Status | Label (English) | Label (Arabic) | Badge Color |
|--------|----------------|----------------|-------------|
| Active workspace | Active Workspace | مساحة عمل نشطة | Emerald |
| Active adjacent | Active Workspace | مساحة عمل نشطة | Emerald |
| Prototype | Prototype | نموذج أولي | Amber |
| Marketing-only | Marketing | تسويق | Neutral/Gray |

## Copy Tone

- **Enterprise**: Serious, structured, operational
- **No hype**: Avoid "revolutionary", "game-changing", "disruptive"
- **Trust language**: "AI assists. Humans decide. Evidence governs."
- **Descriptive**: Explain what the system does, not what it promises
- **Arabic-first**: Marketing content is Arabic-first with English system names preserved
