# AQLIYA Visual QA Checklist

**Version:** 1.0  
**Date:** May 2026  
**Purpose:** Standard QA checks for brand consistency before any release.

---

## Asset Verification

- [ ] All logo files exist at referenced paths
- [ ] Favicon resolves correctly
- [ ] OG image exists for social sharing
- [ ] No broken image paths in any page
- [ ] Logo alt text is descriptive, not generic ("AQLIYA — Mind The Future")

## Color Consistency

- [ ] No hardcoded `#137dc5` (old brand blue) remains — should be `#2563EB`
- [ ] No hardcoded `#2f4598` (old brand indigo) remains — should be `#1E3A8A`
- [ ] No hardcoded `#0baee8` (old brand cyan) remains — should be `#0EA5E9`
- [ ] Dark sections use `#0B1728` or CSS variable equivalents
- [ ] Primary buttons use `bg-primary` or current brand blue `#2563EB`
- [ ] Status colors use CSS tokens, not arbitrary hex values

## Typography

- [ ] Heading hierarchy follows enterprise typography scale
- [ ] Arabic text uses Noto Sans Arabic (variable font)
- [ ] English/Arabic mixing preserves readability
- [ ] Font sizes use the defined scale (text-display, text-h1, etc.)
- [ ] Tabular numbers used for financial data

## Navigation

- [ ] Module labels are consistent across sidebar, header, and breadcrumbs
- [ ] Active state is visually distinct
- [ ] CTA labels match the UI Copy Guide
- [ ] No dead links to nonexistent routes
- [ ] Module switcher shows correct module options

## Product Status Labels

- [ ] AuditOS = Active Workspace
- [ ] DecisionOS = Active Workspace
- [ ] SalesOS = Prototype
- [ ] SimulationOS = Marketing
- [ ] Local Content OS = Marketing
- [ ] Demo routes are labeled as demo

## Homepage

- [ ] Hero section positions AQLIYA as Enterprise Systems Builder
- [ ] Product cards display correct maturity status
- [ ] Trust section uses proof language, not hype
- [ ] CTAs are appropriate for product maturity
- [ ] Arabic/English balance is maintained

## Workspace Shell

- [ ] Platform sidebar shows module-switcher
- [ ] Brand logo in sidebar resolves correctly
- [ ] Header shows correct workspace label per route
- [ ] Command palette opens with ⌘K
- [ ] Module accent colors are used consistently

## Responsive

- [ ] Marketing pages work on mobile (no horizontal scroll)
- [ ] Workspace shell collapses sidebar on mobile
- [ ] Tables horizontally scroll on small screens
- [ ] Touch targets are minimum 44×44px
- [ ] Font sizes are readable on mobile (min 16px body)

## Accessibility

- [ ] Color contrast meets WCAG AA minimum (4.5:1)
- [ ] Interactive elements have focus states
- [ ] Images have alt text
- [ ] Keyboard navigation is supported
- [ ] Status is not conveyed by color alone

## Documentation

- [ ] Brand system docs are up to date
- [ ] Copy guide is followed in all surfaces
- [ ] Product status matrix matches actual implementation
- [ ] README.md reflects current brand positioning

## RTL / LTR

- [ ] Marketing pages are RTL (Arabic-first)
- [ ] Workspace shell supports RTL layout
- [ ] Data tables use LTR for numeric data
- [ ] Mixed English/Arabic text renders correctly
- [ ] Icons respect direction (flipped if needed)

## AI Visual Language

- [ ] No glowing neural network graphics
- [ ] No robot or brain imagery (except logo)
- [ ] AI indicators use subtle cyan accents
- [ ] AI badges indicate confidence and human-review
- [ ] AI language is restrained ("AI assists. Humans decide.")

## QA Passing Criteria

- **P0 (Blocking)**: Broken images, nonexistent routes, incorrect company name
- **P1 (Critical)**: Wrong product status, misleading CTAs, outdated copy
- **P2 (Major)**: Hardcoded old brand colors, inconsistent naming
- **P3 (Minor)**: Spacing alignment, font weight, color shade tolerance
