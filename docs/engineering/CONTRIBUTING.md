# Contributing to AQLIYA

## Code Style
- TypeScript strict mode
- Arabic-first for all UI text (extracted to `messages/ar.json`)
- Logical CSS properties for RTL/LTR compatibility
- Named exports preferred over default exports
- Server Components by default, `"use client"` only when needed

## Pull Request Process
1. Ensure `npx tsc --noEmit` passes
2. Ensure `npm run lint` has 0 errors
3. Ensure `npm run build` succeeds
4. Update docs if changing architecture or APIs

## Commit Messages
Use clear Arabic or English descriptions. Example format:
- `i18n: add Turkish translation for audit components`
- `fix: correct RTL padding in evidence upload zone`
- `feat: add dark mode toggle to settings`
