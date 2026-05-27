---
name: aqliya-low-load-dev
description: Low-load execution protocol for AQLIYA. Controls when heavy commands are allowed, when approval is required, and how to distinguish RAM issues from code issues.
---

# AQLIYA Low-Load Development Protocol

> **Purpose:** Prevent runaway resource consumption, avoid unnecessary builds, and enforce approval gates for destructive or expensive operations.

---

## 1. Command Classification

All commands fall into three categories:

### Light Commands (always allowed)

| Command                                     | Purpose                              |
| ------------------------------------------- | ------------------------------------ |
| `npx tsc --noEmit`                          | TypeScript check (fast, incremental) |
| `npm run lint -- --quiet`                   | Quick lint (existing errors only)    |
| `npx prettier --check "src/**/*.ts"`        | Format check                         |
| `npx prisma validate`                       | Prisma schema syntax check           |
| `git status`, `git diff`, `git log`         | Git inspection                       |
| `cat`, `ls`, `Get-Content`, `Get-ChildItem` | File reading                         |
| grep, rg, glob, read operations             | File search                          |

### Medium Commands (allowed with justification)

| Command                    | When Allowed                                                      |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run build`            | After completion of any feature/mutation that affects server code |
| `npm test` — specific file | When testing a specific module                                    |
| `npx prisma generate`      | After schema changes                                              |
| `npx prisma db seed`       | After seed-affecting schema changes                               |

### Heavy Commands (require explicit approval)

| Command                         | Approval Required                         |
| ------------------------------- | ----------------------------------------- |
| `npm run build` (full)          | Yes — unless explicitly requested by user |
| `npm run lint` (full)           | Yes — unless explicitly requested         |
| `npm test` (full suite)         | Yes — unless explicitly requested         |
| `npx prisma migrate dev`        | Yes — destructive, requires review        |
| `npx prisma migrate deploy`     | Yes — production-impacting                |
| `npm install <package>`         | Yes — dependency change                   |
| `idf.py`, `docker`, `terraform` | Yes — out of scope                        |
| Full cleanup/delete commands    | Yes — destructive                         |

---

## 2. Distinguishing RAM Issue from Code Issue

### Symptoms of RAM/Resource Issues

- TypeScript check succeeds but build fails with `out of memory`
- Build succeeds but dev server crashes on page load
- `next build` exits with `FATAL ERROR: Reached heap limit Allocation failed`
- Slow response even on simple routes
- `node --max-old-space-size=4096` config needed

### Response Protocol

1. **Suspect RAM issue when:**
   - Same code worked before with no changes
   - Error mentions `heap`, `allocation failure`, `out of memory`
   - Only happens on large file sets or complex pages
   - Only happens in dev mode with many HMR updates

2. **Suspect code issue when:**
   - Error has a stack trace pointing to specific code
   - Error has a TypeScript/lint message
   - Error is consistent across environments
   - Error appeared after a specific code change

3. **Resolution:**
   - RAM issue → `node --max-old-space-size=4096 node_modules/.bin/next build`
   - Code issue → fix the code
   - Not sure → ask user for guidance
   - Do not blame RAM for code errors

---

## 3. When to Ask for Permission

### Always ask (even for light commands) when:

- The command modifies `.env`, secrets, or configuration
- The command accesses external APIs with production credentials
- The command deletes files or directories
- The command touches `prisma/schema.prisma`
- The command modifies `middleware.ts` or auth configuration

### Never silently run:

- `npx prisma migrate`
- `npm install`
- `docker-compose up`
- `git push`, `git commit` (unless explicitly told to commit)
- `rm -rf`, `Remove-Item -Recurse`
- Any command that triggers a prisma migration

---

## 4. Pre-Flight Check Before Heavy Commands

Before any heavy command, run:

1. `git status` — what has changed?
2. `git diff --stat` — how much changed?
3. Read relevant files — is the code coherent?
4. Check for existing errors — will this make things worse?

Report findings to user. Do not assume.

---

## 5. Recovery from Failed Heavy Commands

### If build fails:

1. Identify new vs pre-existing errors
2. Report the specific error, not just "build failed"
3. Propose a fix
4. Do not retry without analyzing root cause

### If migration fails:

1. Do not reset database
2. Report the migration error
3. Do not `prisma migrate dev --force` without approval
4. Check migration file for issues
