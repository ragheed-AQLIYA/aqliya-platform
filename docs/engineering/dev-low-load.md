# Low-load development (32GB RAM machines)

Use this when `node.exe` memory spikes during Cursor/Agent work or Chrome Remote Desktop disconnects.

## Likely causes (not always code bugs)

| Cause                    | Signal                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| **Turbopack default**    | `npm run dev` → Next 16 uses Turbopack unless `--webpack` is passed   |
| **Cursor indexing**      | Missing `.cursorignore` → indexes `node_modules`, `.next`, `uploads`  |
| **Stale node processes** | Multiple `node.exe` after failed runs or Agent sessions               |
| **Heap unbounded**       | Single process grows toward system RAM without `--max-old-space-size` |
| **Runtime uploads**      | `uploads/` lives in repo root and is watched by dev tooling           |

## Safe dev start (PowerShell)

Before starting, kill stale processes if RAM is already high:

```powershell
taskkill /F /IM node.exe
wsl --shutdown
```

Then:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev:safe
```

If you only hit a **heap** error (not general RAM pressure), try:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=6144"
npm run dev:safe
```

`dev:safe` uses **webpack** (not Turbopack) and caps Node heap. Original `npm run dev` is unchanged.

## Safe build (when needed)

```powershell
$env:NODE_OPTIONS="--max-old-space-size=6144"
npm run db:generate
npm run build:safe
```

`build:safe` does not run `prisma generate`; run `db:generate` first if the client changed.

## Diagnose runaway node

```powershell
Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Select-Object ProcessId, CommandLine |
  Format-List
```

Look for: `next dev`, `turbopack`, `eslint`, `tsserver`, `jest`, duplicate dev servers.

## Cursor tips

- Reload window after adding/updating `.cursorignore`.
- Avoid running full `lint`, `test`, or `build` in Agent unless necessary.
- Do not run `npm run dev` and `dev:safe` at the same time.
