# AQLIYA — Brand Assets Organization

## File Structure

```
public/brand/
├── logo/
│   ├── primary/
│   │   ├── aqliya-logo-full.svg          # Full logo (icon + wordmark + tagline)
│   │   ├── aqliya-logo-full.png          # PNG version (high-res)
│   │   ├── aqliya-logo-full@2x.png       # Retina version
│   │   └── aqliya-logo-full.pdf          # Print-ready
│   │
│   ├── icon/
│   │   ├── aqliya-icon.svg               # Icon only
│   │   ├── aqliya-icon.png               # PNG version
│   │   └── aqliya-icon@2x.png            # Retina version
│   │
│   ├── wordmark/
│   │   ├── aqliya-wordmark.svg           # Wordmark only
│   │   └── aqliya-wordmark.png           # PNG version
│   │
│   ├── variations/
│   │   ├── aqliya-logo-white.svg         # White version (dark bg)
│   │   ├── aqliya-logo-white.png         # White PNG
│   │   ├── aqliya-logo-monochrome.svg    # Single color
│   │   └── aqliya-logo-reversed.svg      # Reversed colors
│   │
│   ── guidelines/
│       ├── clear-space.svg               # Clear space diagram
│       ├── minimum-size.svg              # Minimum size guide
│       └── incorrect-usage.svg           # Don't examples
│
├── favicons/
│   ├── favicon.ico                       # Traditional favicon
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png              # 180×180
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── mstile-150x150.png
│   └── site.webmanifest
│
├── social/
│   ├── og-image.png                      # 1200×630 (Open Graph)
│   ├── og-image-square.png               # 1200×1200
│   ├── twitter-card.png                  # 1200×600
│   ├── linkedin-banner.png               # 1128×191
│   └── youtube-banner.png                # 2560×1440
│
├── patterns/
│   ├── grid-pattern.svg                  # Subtle grid
│   ├── dot-pattern.svg                   # Dot pattern
│   ├── line-pattern.svg                  # Line pattern
│   └── circuit-pattern.svg               # Circuit-inspired
│
├── illustrations/
│   ├── ai-intelligence.svg               # AI metaphor
│   ├── data-flow.svg                     # Data flow
│   ├── trust-shield.svg                  # Trust/security
│   ├── decision-tree.svg                 # Decision making
│   ── workflow.svg                      # Workflow/process
│
── icons/
│   ├── navigation/
│   │   ├── home.svg
│   │   ├── dashboard.svg
│   │   ├── analytics.svg
│   │   ├── audit.svg
│   │   ├── settings.svg
│   │   └── profile.svg
│   │
│   ├── actions/
│   │   ├── add.svg
│   │   ├── edit.svg
│   │   ├── delete.svg
│   │   ├── download.svg
│   │   ├── upload.svg
│   │   ── share.svg
│   │
│   ├── status/
│   │   ├── success.svg
│   │   ├── warning.svg
│   │   ├── error.svg
│   │   ├── info.svg
│   │   └── pending.svg
│   │
│   ├── ai/
│   │   ├── intelligence.svg
│   │   ├── orchestration.svg
│   │   ├── insight.svg
│   │   ├── verification.svg
│   │   └── automation.svg
│   │
│   └── financial/
│       ├── chart.svg
│       ├── currency.svg
│       ├── report.svg
│       ├── audit.svg
│       └── analytics.svg
│
├── templates/
│   ├── presentation/
│   │   ├── aqliya-pptx-template.pptx
│   │   └── aqliya-keynote-template.key
│   │
│   ├── document/
│   │   ├── aqliya-letterhead.docx
│   │   ├── aqliya-report-template.docx
│   │   └── aqliya-proposal-template.docx
│   │
│   └── email/
│       ├── email-signature.html
│       └── email-template.html
│
├── fonts/
│   ├── inter/
│   │   ├── Inter-Regular.woff2
│   │   ├── Inter-Medium.woff2
│   │   ├── Inter-SemiBold.woff2
│   │   └── Inter-Bold.woff2
│   │
│   ├── plus-jakarta-sans/
│   │   ├── PlusJakartaSans-Medium.woff2
│   │   ├── PlusJakartaSans-SemiBold.woff2
│   │   └── PlusJakartaSans-Bold.woff2
│   │
│   └── ibm-plex-sans-arabic/
│       ├── IBMPlexSansArabic-Regular.woff2
│       ├── IBMPlexSansArabic-Medium.woff2
│       ├── IBMPlexSansArabic-SemiBold.woff2
│       └── IBMPlexSansArabic-Bold.woff2
│
├── documentation/
│   ├── AQLIYA-VISUAL-IDENTITY-SYSTEM.md  # Full brand guide
│   ├── QUICK-REFERENCE.md                # Quick reference
│   ├── COMPONENT-LIBRARY.md              # Component guide
│   ├── BRAND-ASSETS-ORGANIZATION.md      # This file
│   └── IMPLEMENTATION-CHECKLIST.md       # Dev checklist
│
└── exports/
    ├── brand-kit.zip                     # Complete brand kit
    ├── logo-pack.zip                     # Logo files only
    ├── icon-pack.zip                     # Icon files only
    ── font-pack.zip                     # Font files only
```

## File Naming Convention

```
Format: aqliya-[type]-[variant]-[size].[ext]

Examples:
- aqliya-logo-full.svg
- aqliya-logo-white.png
- aqliya-icon-32x32.png
- aqliya-wordmark-reversed.svg
```

## Export Settings

### SVG Files
- Clean, optimized SVG
- No unnecessary metadata
- Proper viewBox
- Scalable without quality loss

### PNG Files
- @1x: Standard resolution
- @2x: Retina/High-DPI
- Transparent background
- Optimized file size

### PDF Files
- Print-ready (300 DPI)
- CMYK color profile
- Embedded fonts
- Bleed marks if needed

## Color Profiles

### Digital
- RGB color space
- sRGB profile
- 72-150 DPI

### Print
- CMYK color space
- 300 DPI minimum
- Bleed: 3mm

## Asset Checklist

### Required for Launch
- [ ] Logo (all variations)
- [ ] Favicon package
- [ ] Social media images
- [ ] Font files (web-optimized)
- [ ] Icon set (core icons)
- [ ] Brand documentation
- [ ] Color tokens
- [ ] Typography styles

### Optional (Phase 2)
- [ ] Illustration set
- [ ] Presentation templates
- [ ] Document templates
- [ ] Email templates
- [ ] Video intro/outro
- [ ] Motion graphics assets

## Brand Kit Distribution

### Internal Team
- Full brand kit access
- All source files
- Design system documentation
- Component library access

### External Partners
- Logo pack (approved formats)
- Brand guidelines (PDF)
- Color palette reference
- Typography reference

### Public
- Press kit
- Logo (PNG/SVG)
- Brand story
- Media assets

## Version Control

```
v1.0 - Initial release (May 2026)
v1.1 - [Future updates]
v2.0 - Major revision
```

## Asset Approval Process

1. Design team creates/updates asset
2. Brand review against guidelines
3. Stakeholder approval
4. Version update
5. Distribution to relevant channels
6. Documentation update
