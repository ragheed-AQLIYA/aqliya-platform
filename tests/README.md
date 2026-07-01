# Tests Directory

> **Note:** This directory is reserved for future test files.

All active test files are co-located with source code in `src/__tests__/`.

- **Unit tests:** `src/__tests__/unit/`
- **Integration tests:** `src/__tests__/integration/`
- **Component tests:** `src/__tests__/components/`
- **E2E tests:** `cypress/`

To run tests:

```bash
npm test              # full Jest suite (3754+ tests)
npm run test:unit     # unit tests only
npm run cy:run        # Cypress E2E
```
