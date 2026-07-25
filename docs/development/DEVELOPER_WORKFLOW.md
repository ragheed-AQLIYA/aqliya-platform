# Developer Workflow Guide

**Status:** Active | **Version:** 1.0 | **Date:** 2026-07-24 | **Owner:** Engineering Team

This guide covers day-to-day development workflows for the AQLIYA platform. It is written for developers who have read `AGENTS.md` and `docs/DOCUMENTATION_AUTHORITY.md`.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Project Structure](#2-project-structure)
3. [Common Workflows](#3-common-workflows)
4. [Architecture Patterns](#4-architecture-patterns)
5. [Testing](#5-testing)
6. [Code Quality](#6-code-quality)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Getting Started

### 1.1 Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 20.0.0, <= 24.x | LTS recommended (v22) |
| npm | >= 10.0.0 | Comes with Node |
| Docker | Latest | For PostgreSQL, Redis, ClamAV |
| PostgreSQL | 16 | Via Docker or local install |
| Git | Latest | |

### 1.2 Clone and Setup

```bash
git clone <repository-url>
cd aqliya
```

### 1.3 Environment Variables

Copy the example environment file and configure required values:

```bash
cp .env.example .env
```

**Required variables** (minimum for local development):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aqliya?connection_limit=20&pool_timeout=10
AUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

> **Important:** `AUTH_SECRET` is required at runtime. `NEXTAUTH_SECRET` is accepted as a legacy alias by `validate-env.mjs` only.

### 1.4 Database Setup

Start PostgreSQL via Docker:

```bash
sudo docker compose up -d db
```

Wait for the health check to pass, then push the schema and seed:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

**Default seed users:**
- `admin@aqliya.com` / `admin123` (ADMIN role)
- Other users defined in `prisma/seed.ts`

### 1.5 Running Locally

```bash
# Install dependencies (postinstall runs prisma generate + env validation)
npm install

# Start development server (webpack mode recommended for stability)
npm run dev:safe

# Or use Turbopack (may have issues on some Linux VMs)
npm run dev
```

The app runs at http://localhost:3000.

### 1.6 Alternative: Docker Compose (Full Stack)

```bash
sudo docker compose up -d
```

This starts PostgreSQL, Redis, ClamAV, the app, and the backup service.

---

## 2. Project Structure

```
aqliya/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Authenticated workspace routes
│   │   ├── (marketing)/        # Public marketing pages
│   │   ├── api/                # API route handlers
│   │   ├── audit/              # AuditOS workspace
│   │   ├── auditos/            # AuditOS public demo
│   │   ├── local-content/      # LocalContentOS workspace
│   │   └── layout.tsx          # Root layout (arabic-first, RTL)
│   ├── actions/                # Server Actions ("use server")
│   ├── components/             # UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── audit/              # AuditOS components
│   │   ├── local-content/      # LocalContentOS components
│   │   ├── sales/              # SalesOS components
│   │   └── platform/           # Platform-wide components
│   ├── lib/                    # Business logic and services
│   │   ├── kernel/             # Kernel 2.0 (shared core)
│   │   ├── authorization/      # RBAC/ABAC engine
│   │   ├── ai/                 # AI provider abstraction
│   │   ├── audit/              # AuditOS domain logic
│   │   ├── local-content/      # LocalContentOS domain logic
│   │   ├── platform/           # Platform infrastructure
│   │   ├── prisma.ts           # Prisma client (server-only)
│   │   └── api-response.ts     # Standardized API response wrapper
│   ├── __tests__/              # Test files
│   └── __mocks__/              # Test mocks
├── prisma/
│   ├── schema.prisma           # Canonical database schema
│   ├── seed.ts                 # Base seed data
│   ├── seed-pilot.ts           # Pilot seed data
│   └── seed-localcontent.ts    # LocalContentOS seed data
├── docs/                       # Documentation
├── scripts/                    # Platform and operational scripts
├── public/                     # Static assets
└── uploads/                    # Local file storage (dev)
```

### Key Conventions

- **`@/*`** path alias maps to `src/*`
- **Server-only code** is imported from `src/lib/` (Prisma, auth, services)
- **Client components** must never import from `@/lib/prisma` or server-only modules
- **Arabic-first** UX: primary text is Arabic, English where intentional

---

## 3. Common Workflows

### 3.1 Adding a New API Route

**Location:** `src/app/api/<resource>/route.ts`

**Steps:**

1. Create the route file
2. Export named functions (`GET`, `POST`, `PUT`, `DELETE`)
3. Add authentication check
4. Add tenant isolation
5. Add audit logging
6. Return standardized `ApiResponse`

**Example:**

```typescript
// src/app/api/local-content/suppliers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();

    // 2. Authorization + tenant isolation
    await enforce(user, { type: "supplier" }, "read");

    // 3. Query with tenant scoping
    const suppliers = await prisma.lcSupplier.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Audit trail (read operations are optional but recommended)
    await writePlatformAuditLog({
      productKey: "local-content",
      platformOrganizationId: user.organizationId,
      action: "SUPPLIER_LISTED",
      actorId: user.id,
      actorType: "user",
      targetType: "supplier",
    });

    // 5. Return standardized response
    return NextResponse.json({
      success: true,
      data: suppliers,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message, 500),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "supplier" }, "admin");

    const body = await request.json();

    // Validate input
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Supplier name is required", 400),
        { status: 400 },
      );
    }

    const supplier = await prisma.lcSupplier.create({
      data: {
        name: body.name.trim(),
        organizationId: user.organizationId,
        createdById: user.id,
      },
    });

    // Audit trail for mutation (required)
    await writePlatformAuditLog({
      productKey: "local-content",
      platformOrganizationId: user.organizationId,
      action: "SUPPLIER_CREATED",
      actorId: user.id,
      actorType: "user",
      targetType: "supplier",
      targetId: supplier.id,
      targetLabel: supplier.name,
    });

    return NextResponse.json({
      success: true,
      data: supplier,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message, 500),
      { status: 500 },
    );
  }
}
```

### 3.2 Adding a New Server Action

**Location:** `src/actions/<resource>-actions.ts`

**Steps:**

1. Create the action file with `"use server"` directive
2. Import auth, enforcement, and audit utilities from kernel
3. Add authentication via `getCurrentUser()`
4. Add authorization via `enforce()`
5. Add audit logging for mutations
6. Call `revalidatePath()` after mutations
7. Return `{ ok: true, data }` or `{ ok: false, error }`

**Example:**

```typescript
// src/actions/my-resource-actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── List ───

export async function listMyResourcesAction() {
  const user = await getCurrentUser();
  await enforce(user, { type: "my-resource" }, "read");

  const items = await prisma.myResource.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return { ok: true, data: items };
}

// ─── Create ───

export async function createMyResourceAction(data: {
  name: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  await enforce(user, { type: "my-resource" }, "admin");

  // Input validation
  if (!data.name || data.name.trim().length < 2) {
    return { ok: false, error: "Name must be at least 2 characters" };
  }

  const item = await prisma.myResource.create({
    data: {
      name: data.name.trim(),
      description: data.description,
      organizationId: user.organizationId,
      createdById: user.id,
    },
  });

  // Audit trail (required for mutations)
  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: user.organizationId,
    action: "MY_RESOURCE_CREATED",
    actorId: user.id,
    actorType: "user",
    targetType: "my-resource",
    targetId: item.id,
    targetLabel: item.name,
  });

  revalidatePath("/my-resources");
  return { ok: true, data: item };
}

// ─── Update ───

export async function updateMyResourceAction(
  id: string,
  data: { name?: string; description?: string },
) {
  const user = await getCurrentUser();
  await enforce(user, { type: "my-resource", id }, "admin");

  const item = await prisma.myResource.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      updatedById: user.id,
    },
  });

  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: user.organizationId,
    action: "MY_RESOURCE_UPDATED",
    actorId: user.id,
    actorType: "user",
    targetType: "my-resource",
    targetId: item.id,
    targetLabel: item.name,
  });

  revalidatePath("/my-resources");
  revalidatePath(`/my-resources/${id}`);
  return { ok: true, data: item };
}
```

### 3.3 Adding a New Page

**Location:** `src/app/(dashboard)/<route>/page.tsx` for authenticated pages, or `src/app/(marketing)/<route>/page.tsx` for public pages.

**Steps:**

1. Create `page.tsx` in the appropriate directory
2. Add `export const dynamic = "force-dynamic"` if using server-side data
3. Create `loading.tsx` for loading state
4. Create `error.tsx` for error boundary
5. Use existing UI components from `@/components/ui/`
6. Use Arabic-first copy

**Example:**

```typescript
// src/app/(dashboard)/my-resources/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { listMyResourcesAction } from "@/actions/my-resource-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyResourcesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let items: Awaited<ReturnType<typeof listMyResourcesAction>>["data"] = [];
  try {
    const result = await listMyResourcesAction();
    items = result.data ?? [];
  } catch {
    return (
      <div className="p-8 max-w-6xl mx-auto" dir="rtl">
        <p className="text-destructive">لا تملك صلاحية الوصول</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-black text-foreground mb-6">
        مواردي
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="لا توجد موارد بعد"
          description="أضف أول مورد للبدء"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description ?? "بدون وصف"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Loading state** (`loading.tsx`):

```typescript
// src/app/(dashboard)/my-resources/loading.tsx

import { FolderOpen } from "lucide-react";

export default function MyResourcesLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <FolderOpen className="h-12 w-12 text-primary/40 animate-pulse" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">
        جارٍ التحميل...
      </p>
    </div>
  );
}
```

### 3.4 Adding a New Component

**Location:** `src/components/<product>/<component-name>.tsx`

**Steps:**

1. Create the component file in the appropriate product directory
2. Use `"use client"` only when the component needs interactivity
3. Use shadcn/ui primitives from `@/components/ui/`
4. Follow PascalCase naming for components, kebab-case for files
5. Export named components (not default exports for reusable components)

**Example:**

```typescript
// src/components/local-content/supplier-card.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface SupplierCardProps {
  name: string;
  classification?: "local" | "imported" | "unknown";
  spendAmount?: number;
}

export function SupplierCard({
  name,
  classification = "unknown",
  spendAmount,
}: SupplierCardProps) {
  const variantMap = {
    local: "default" as const,
    imported: "secondary" as const,
    unknown: "outline" as const,
  };

  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">{name}</CardTitle>
        </div>
        <Badge variant={variantMap[classification]}>
          {classification === "local" ? "محلي" : classification === "imported" ? "مستورد" : "غير محدد"}
        </Badge>
      </CardHeader>
      {spendAmount !== undefined && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            إجمالي الإنفاق: {spendAmount.toLocaleString("ar-SA")} ر.س
          </p>
        </CardContent>
      )}
    </Card>
  );
}
```

### 3.5 Adding a New Prisma Model

**Steps:**

1. Add the model to `prisma/schema.prisma`
2. Always include tenant isolation fields (`organizationId` or `platformOrganizationId`)
3. Add `createdById` and `updatedById` for auditability
4. Add `createdAt` and `updatedAt` timestamps
5. Add appropriate indexes
6. Run the migration
7. Update seed scripts if needed

**Required fields for every business model:**

```prisma
model MyResource {
  id                     String   @id @default(cuid())
  organizationId         String   // Tenant isolation (required)
  platformOrganizationId String? // Platform-level org reference
  createdById            String?  // Who created this
  updatedById            String?  // Who last updated this
  name                   String
  status                 String   @default("active")
  metadata               Json?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  // Relations
  // ...

  // Indexes
  @@index([organizationId, createdAt])
  @@index([createdById])
  @@index([status])
}
```

**Run the migration:**

```bash
npx prisma generate
npx prisma db push          # For development (no migration file)
npx prisma migrate dev      # For production-ready migrations
```

### 3.6 Adding a New Feature Flag

Feature flags are registered in `src/lib/platform/feature-flags/registry.ts` and accessed via the kernel.

**Steps:**

1. Add the flag definition to the registry
2. Set the environment variable `FF_<FLAG_NAME>=false`
3. Use the kernel helper to check the flag

**Registry entry:**

```typescript
// In src/lib/platform/feature-flags/registry.ts

"my-feature": {
  key: "my-feature",
  name: "My New Feature",
  description: "Description of what this flag controls.",
  variant: "off",       // "on" | "off"
  owner: "eng",         // Team that owns this flag
  dependencies: [],     // Other flags this depends on
  createdAt: "2026-07-24",
  updatedAt: "2026-07-24",
},
```

**Usage in code:**

```typescript
import { isEnabled } from "@/lib/kernel";

// Server-side (Server Actions, route handlers)
if (isEnabled("my-feature")) {
  // Feature is enabled
}
```

**Environment variable:**

```bash
FF_MY_FEATURE=false    # .env
```

---

## 4. Architecture Patterns

### 4.1 Kernel 2.0

The Kernel (`src/lib/kernel/`) is the shared platform core. All products import shared capabilities from the kernel.

**Key exports from `@/lib/kernel`:**

```typescript
// Authorization
import { enforce, isAllowed } from "@/lib/kernel";

// Auth
import { getCurrentUser } from "@/lib/kernel";

// Feature flags
import { isEnabled, requireEnabled } from "@/lib/kernel";

// Caching
import { getCachedOrFetch, invalidateDashboardCaches } from "@/lib/kernel";

// Types
import type { PaginatedResult, KernelResult } from "@/lib/kernel";
```

**Kernel bootstrap** happens in `src/app/layout.tsx`:

```typescript
import { initializeKernel } from "@/lib/kernel/bootstrap";

export default async function RootLayout({ children }) {
  await initializeKernel();
  // ...
}
```

### 4.2 Plugin System

Each product registers as a `ProductPlugin` via the `ProductRegistry`:

```typescript
import type { ProductPlugin } from "@/lib/kernel/plugin/product-plugin";

const myPlugin: ProductPlugin = {
  id: "my-product",
  name: "My Product",
  version: "0.1.0",
  description: "Product description",
  requiredCapabilities: ["identity", "tenant", "events"],
  dependencies: {},
  async initialize() { /* ... */ },
  async shutdown() { /* ... */ },
  async healthCheck() { return { status: "healthy" }; },
  getRoutes() { return [{ path: "/my-product", type: "workspace" }]; },
  getSchemas() { return [{ model: "MyResource", key: "my-resource" }]; },
};
```

### 4.3 Event Bus

The event bus (`src/lib/kernel/events/`) enables cross-product event publishing:

```typescript
import { Kernel } from "@/lib/kernel";

const kernel = Kernel.getInstance();
const eventBus = kernel.getService<IEventBus>("events");

await eventBus.publish({
  domain: "local-content",
  type: "supplier.created",
  payload: { supplierId: "abc123", name: "Acme Corp" },
  actorId: user.id,
  organizationId: user.organizationId,
});
```

### 4.4 Pagination Pattern

All server actions that return lists must use the standard paginated format:

```typescript
// Return type
interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
}

// Usage
const items = await prisma.myResource.findMany({
  where: { organizationId },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
});

const totalCount = await prisma.myResource.count({
  where: { organizationId },
});

return {
  items,
  totalCount,
  hasMore: page * pageSize < totalCount,
};
```

### 4.5 Authorization (RBAC/ABAC)

The authorization engine is accessed through the kernel's `enforce()` function:

```typescript
import { enforce } from "@/lib/kernel";

// Basic role check (RBAC)
await enforce(user, { type: "organization" }, "read");    // Any authenticated user
await enforce(user, { type: "organization" }, "admin");   // ADMIN only

// Resource-specific check
await enforce(user, { type: "supplier", id: supplierId }, "read");
```

**Roles:** `ADMIN`, `OPERATOR`, `VIEWER`

### 4.6 Structured Logging

Replace `console.log` with structured logging in production code:

```typescript
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({
  product: "local-content",
  action: "supplier-create",
  userId: user.id,
  organizationId: user.organizationId,
});

logger.info("Supplier created", { supplierId: supplier.id });
logger.error("Failed to create supplier", error, { name: data.name });
```

### 4.7 Caching

Use the kernel cache layer for dashboard reads:

```typescript
import { getCachedOrFetch } from "@/lib/kernel";

const data = await getCachedOrFetch(
  `my-cache-key:${organizationId}`,
  async () => {
    // Expensive query
    return await prisma.myResource.findMany({ where: { organizationId } });
  },
  { ttlMs: 5 * 60 * 1000 }, // 5 minutes
);
```

---

## 5. Testing

### 5.1 Test Structure

Tests live in `src/__tests__/` organized by type:

```
src/__tests__/
├── unit/          # Fast, isolated unit tests
├── integration/   # Tests requiring DB or external services
├── i18n/          # Internationalization tests
└── setup.ts       # Global test setup
```

### 5.2 Running Tests

```bash
# Full test suite
npm test

# Unit tests only
npm run test:unit

# Integration tests (requires test DB)
npm run test:integration:setup   # Start test DB
npm run test:integration

# I18n tests
npm run test:i18n

# Specific test file
npx jest -- src/__tests__/unit/my-module.test.ts
```

### 5.3 Test Setup

The test setup file (`src/__tests__/setup.ts`) configures module mocks:

- `@/lib/auth` is mocked (returns test user)
- `@prisma/client` is mocked (in-memory)
- `next-auth` is mocked
- `server-only` is mocked

### 5.4 Writing Unit Tests

```typescript
// src/__tests__/unit/my-module.test.ts

import { myFunction } from "@/lib/my-module";

describe("myFunction", () => {
  it("should return expected result for valid input", () => {
    const result = myFunction("test");
    expect(result).toBe("expected");
  });

  it("should throw for invalid input", () => {
    expect(() => myFunction("")).toThrow("Input required");
  });
});
```

### 5.5 E2E Tests

Cypress is configured for E2E testing:

```bash
# Start the app in standalone mode
npm run start:standalone:e2e

# In another terminal, run Cypress
npm run cy:local
```

### 5.6 Coverage

Coverage thresholds are configured in `jest.config.js`:

| Metric | Threshold |
|--------|-----------|
| Branches | 24% |
| Functions | 27% |
| Lines | 33% |
| Statements | 32% |

---

## 6. Code Quality

### 6.1 TypeScript

TypeScript is configured in strict mode (`tsconfig.json`):

- `strict: true`
- `noEmit: true`
- `moduleResolution: "bundler"`
- Path alias: `@/*` → `./src/*`

**Type check:**

```bash
npx tsc --noEmit
```

### 6.2 ESLint

ESLint uses Next.js recommended config with security plugin:

```bash
npm run lint
```

**Key rules:**
- `@typescript-eslint/no-unused-vars` — warn (prefix unused with `_`)
- `eslint-plugin-security` — recommended security rules
- Known noisy modules are excluded via `globalIgnores`

### 6.3 Prettier

Prettier is configured via lint-staged and runs on commit:

```bash
# Check formatting
npx prettier --check src/

# Format all files
npx prettier --write src/
```

### 6.4 Pre-commit Hooks

Husky + lint-staged runs automatically on commit:

- `*.{ts,tsx}` → ESLint fix + Prettier
- `*.{json,css,md}` → Prettier

### 6.5 Production Code Rules

- **No `console.log`** in production code — use `createLogger()` from `@/lib/observability/logger`
- **No `as any`** — use proper type narrowing or documented alternatives
- **No Prisma in client components** — always go through Server Actions
- **No secrets in code** — use environment variables

---

## 7. Troubleshooting

### Build Failures

```bash
# Full validation pipeline
npx tsc --noEmit && npm run lint && npm run build
```

### Prisma Issues

```bash
npx prisma generate          # Regenerate client
npx prisma validate          # Validate schema syntax
npx prisma db push           # Push schema to dev DB
```

### Memory Issues During Build

```bash
# Use increased memory allocation
npm run build:safe           # 6GB heap
# Or manually:
node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build --webpack
```

### Environment Variable Issues

```bash
npm run validate:env         # Check required env vars
```

### Database Connection Issues

Ensure Docker PostgreSQL is running:

```bash
sudo docker compose up -d db
sudo docker compose ps       # Verify db is healthy
```

### Test Mock Issues

Tests use module mocks in `src/__mocks__/`. If you add new server-only imports, add corresponding mocks in the jest config `moduleNameMapper`.

---

## Appendix: Quick Reference Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server (safe) | `npm run dev:safe` |
| Build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Unit tests | `npm run test:unit` |
| Generate Prisma | `npx prisma generate` |
| Push schema | `npx prisma db push` |
| Validate env | `npm run validate:env` |
| Format code | `npx prettier --write src/` |
| Database studio | `npm run db:studio` |
| Seed database | `npx prisma db seed` |
| Start production | `npm run build && npm run start` |
