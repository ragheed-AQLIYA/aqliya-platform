# Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/aqliya?schema=public` |
| `AUTH_SECRET` | Yes | NextAuth.js encryption secret (min 32 chars) | Generate via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Canonical URL of the deployed app | `https://aqliya.vercel.app` |
| `NODE_ENV` | Yes | Must be `production` in preview/prod | `production` |

## Notes

- **DATABASE_URL**: Must use a PostgreSQL provider. The app uses `@prisma/adapter-pg` (Driver Adapter), not the standard Prisma client. Connection string must include `?schema=public`.
- **AUTH_SECRET**: Required by NextAuth.js v5 for JWT encryption. Generate via `openssl rand -base64 32`. Never commit to version control.
- **NEXTAUTH_URL**: Used by NextAuth.js for callback URLs. Must match the deployment domain exactly.
- **NODE_ENV**: Set automatically by Vercel. For Docker, set explicitly to `production`.
