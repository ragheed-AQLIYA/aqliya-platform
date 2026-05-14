# DecisionOS - Technical Overview

## Tech Stack

### Frontend
- **Next.js 16.2.4** (App Router)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (v4)
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend
- **Prisma ORM v7.8.0** (Driver adapters)
- **SQLite** (Development) via `@prisma/adapter-better-sqlite3`
- **PostgreSQL** (Production - configed but not yet migrated)

### Key Libraries
- **Zod** - Validation schemas
- **React 19** - Hooks for client components
- **next/navigation** - Routing

---

## Folder Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + Header + RTL
│   │   ├── page.tsx              # Landing page (Arabic)
│   │   ├── decisions/
│   │   │   ├── page.tsx            # Decision list (server component)
│   │   │   ├── new/page.tsx        # Create decision (stub)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Decision overview (server)
│   │   │       ├── tender/page.tsx    # Tender form (client)
│   │   │       ├── simulation/page.tsx # Simulation (client)
│   │   │       ├── recommendation/page.tsx # Recommendation (server)
│   │   │       ├── governance/page.tsx # Audit/approvals (client)
│   │   │       └── report/page.tsx    # Decision report (client)
│   │   ├── organizations/
│   │   │   ├── page.tsx          # Orgs list (mock)
│   │   │   └── [id]/page.tsx     # Org detail (mock)
│   │   └── settings/page.tsx      # Settings (mock)
│   ├── login/page.tsx           # Auth placeholder
│   ├── layout.tsx              # Root layout (RTL, Arabic)
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn components (button, card, table, etc.)
│   ├── layout/
│   │   ├── sidebar.tsx          # Navigation (Arabic, RTL)
│   │   └── header.tsx            # Top bar
│   └── decisions/
│       └── decision-tabs.tsx     # Tabs for decision flow
├── actions/
│   ├── decisions.ts            # Server Actions for decisions
│   ├── tender.ts              # Server Actions for tender
│   └── simulation.ts          # Server Actions for simulation
├── lib/
│   ├── prisma.ts               # Prisma client (v7 adapter)
│   ├── utils.ts                # Utility functions
│   ├── validation/
│   │   └── decision.ts        # Zod schemas
│   ├── simulation/
│   │   └── tender-simulation.ts # Simulation engine
│   └── recommendation/
│       └── tender-recommendation.ts # Recommendation engine
└── types/
    └── decision.ts             # TypeScript types
```

---

## Prisma Models (15 Models)

### Core Models
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  users     User[]
  decisions Decision[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String
  role           UserRole     @default(MEMBER)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  ownedDecisions     Decision[]   @relation("DecisionOwner")
  reviewedDecisions  Decision[]   @relation("DecisionReviewer")
  approvedDecisions  Decision[]   @relation("DecisionApprover")
  approvals      Approval[]   @relation("ApprovalApprover")
  auditLogs      AuditLog[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

### Decision & Related
```prisma
model Decision {
  id             String        @id @default(cuid())
  title          String
  type           DecisionType  @default(TENDER)
  ownerId        String
  owner          User          @relation("DecisionOwner", fields: [ownerId], references: [id])
  reviewerId     String?
  reviewer       User?         @relation("DecisionReviewer", fields: [reviewerId], references: [id])
  approverId     String?
  approver       User?         @relation("DecisionApprover", fields: [approverId], references: [id])
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])
  status         DecisionStatus @default(DRAFT)
  tenderProfile  TenderProfile?
  objectives     Objective[]
  constraints    Constraint[]
  assumptions    Assumption[]
  alternatives   Alternative[]
  risks          Risk[]
  scenarios      Scenario[]
  simulations    SimulationResult[]
  recommendation Recommendation?
  approvals      Approval[]
  auditLogs      AuditLog[]
  versions       DecisionVersion[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

### Tender & Simulation
```prisma
model TenderProfile {
  id                     String   @id @default(cuid())
  decisionId             String   @unique
  decision               Decision @relation(fields: [decisionId], references: [id])
  clientName             String
  estimatedContractValue Float
  estimatedCost          Float
  durationMonths         Int
  requiredCapacity       Int
  internalAvailableCapacity Int
  strategicFitScore      Int
  riskLevel              RiskLevel
  marginEstimate         Float
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model Scenario {
  id          String       @id @default(cuid())
  decisionId  String
  decision    Decision     @relation(fields: [decisionId], references: [id])
  type        ScenarioType
  simulation  SimulationResult?
  @@unique([decisionId, type])
}

model SimulationResult {
  id                  String   @id @default(cuid())
  decisionId          String
  decision            Decision @relation(fields: [decisionId], references: [id])
  scenarioId         String?  @unique
  scenario            Scenario? @relation(fields: [scenarioId], references: [id])
  feasibilityScore    Float
  financialScore      Float
  capacityScore       Float
  riskScore           Float
  strategicFitScore   Float
  overallDecisionScore Float
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### Governance & Audit
```prisma
model Recommendation {
  id             String            @id @default(cuid())
  decisionId     String            @unique
  decision       Decision          @relation(fields: [decisionId], references: [id])
  type           RecommendationType
  confidenceScore Float?
  reasoning      String?
  conditions     String?
  riskNotes      String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model Approval {
  id          String        @id @default(cuid())
  decisionId  String
  decision    Decision      @relation(fields: [decisionId], references: [id])
  approverId  String
  approver    User          @relation("ApprovalApprover", fields: [approverId], references: [id])
  status      ApprovalStatus @default(PENDING)
  comments    String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model AuditLog {
  id          String   @id @default(cuid())
  decisionId  String
  decision    Decision @relation(fields: [decisionId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      AuditAction
  entity      String?
  before      String?
  after       String?
  createdAt   DateTime @default(now())
}
```

---

## Server Actions

### `src/actions/decisions.ts`
```typescript
// Get all decisions with org, owner, tenderProfile
export async function getDecisions()

// Get single decision with ALL relations
export async function getDecisionById(id: string)

// Create new decision (DRAFT status)
export async function createDecision(data: {...})

// Update decision status
export async function updateDecisionStatus(id: string, status: string)
```

### `src/actions/tender.ts`
```typescript
// Get tender profile for decision
export async function getTenderProfile(decisionId: string)

// Create or update tender + create AuditLog
export async function createOrUpdateTenderProfile(
  decisionId: string,
  data: {...},
  userId: string
)
```

### `src/actions/simulation.ts`
```typescript
// Run simulation for all 3 scenarios + generate recommendation
export async function runSimulationAndRecommendation(decisionId: string)

// Get existing simulation results
export async function getSimulationResults(decisionId: string)
```

---

## Simulation Logic

### Location: `src/lib/simulation/tender-simulation.ts`

### Weights
```typescript
const WEIGHTS = {
  financial: 0.30,    // 30%
  capacity: 0.25,     // 25%
  risk: 0.25,        // 25%
  strategicFit: 0.20  // 20%
}
```

### Score Calculations

#### Financial Score (0-100)
- Base: `marginEstimate * 5` (20% margin = 100 score)
- ROI: `((contractValue - cost) / cost) * 100 * 2`
- Combined: `marginScore * 0.6 + roiScore * 0.4`
- Scenario adjustment: Best +10%, Expected 0%, Worst -20%

#### Capacity Score (0-100)
- Ratio: `internalAvailableCapacity / requiredCapacity`
- Mapping:
  - Ratio ≥ 1.5 → 100
  - Ratio ≥ 1.2 → 85
  - Ratio ≥ 1.0 → 70
  - Ratio ≥ 0.8 → 50
  - < 0.8 → 30
- Scenario adjustment: Best +15%, Expected 0%, Worst -15%

#### Risk Score (0-100)
- Base from RiskLevel:
  - LOW → 85
  - MEDIUM → 65
  - HIGH → 40
- Scenario adjustment: Best +10%, Expected 0%, Worst -25%

#### Feasibility Score
- Weighted: `financial * 0.4 + capacity * 0.4 + risk * 0.2`

#### Overall Decision Score
- Weighted: `financial * 0.30 + capacity * 0.25 + risk * 0.25 + strategicFit * 0.20`

---

## Recommendation Logic

### Location: `src/lib/recommendation/tender-recommendation.ts`

### Recommendation Type
```typescript
if (overallScore >= 75) → "GO"
if (overallScore >= 55) → "GO_WITH_CONDITIONS"
else → "NO_GO"
```

### Confidence Score (0-100)
Base: 70
- Scenario consistency:
  - Gap < 15 → +20
  - Gap < 25 → +10
  - Gap > 40 → -15
- Risk level:
  - LOW → +10
  - HIGH → -15
- Margin:
  - ≥ 15% → +10
  - < 5% → -10

### Conditions (for GO_WITH_CONDITIONS)
Auto-generated based on:
- Capacity score < 75 → "Reallocate internal capacity..."
- Financial score < 70 → "Improve margin through cost optimization..."
- Risk level !== LOW → "Develop comprehensive risk mitigation plan..."

### Risk Notes
- HIGH → "High risks identified. Detailed risk management plan required..."
- MEDIUM → "Medium risks present. Mitigation strategies should be documented..."
- LOW → "Low risk profile. Standard monitoring procedures sufficient..."

---

## Known Technical Debt

### 1. Authentication
- **Issue**: Hardcoded `"mock-user-id"` in `src/actions/tender.ts`
- **Impact**: Audit logs show mock user ID
- **Fix**: Implement simple auth session management

### 2. Organizations Pages
- **Issue**: `/organizations` and `/organizations/[id]` still use mock data
- **Impact**: Cannot manage organizations with real data
- **Fix**: Create `actions/organizations.ts` and connect pages

### 3. Settings Page
- **Issue**: `/settings` uses static mock data
- **Impact**: No real settings management
- **Fix**: Build settings actions and connect to user/org preferences

### 4. Prisma v7 Migration
- **Issue**: Schema adapted for v7 but no PostgreSQL migrations run
- **Impact**: Still using SQLite for development
- **Fix**: Set up PostgreSQL, run `prisma migrate dev`

### 5. Error Handling
- **Issue**: Basic error handling in Server Actions
- **Impact**: Generic error messages to user
- **Fix**: Implement better error types and user-friendly messages

### 6. Form Validation UI
- **Issue**: No visual feedback for Zod validation errors
- **Impact**: Users don't see what fields are invalid
- **Fix**: Show validation errors below form fields

### 7. Loading States
- **Issue**: Basic loading indicators
- **Impact**: Poor UX during data fetching
- **Fix**: Add skeleton loaders, better loading UI

### 8. Next.js Lockfile Warning
- **Issue**: "Multiple lockfiles detected" warning during build
- **Impact**: Console noise, not a breaking issue
- **Fix**: Set `turbopack.root` in `next.config.ts` or remove root `package-lock.json`

### 9. TypeScript `any` Usage
- **Issue**: Some `any` types in pages for flexibility
- **Impact**: Reduced type safety
- **Fix**: Create proper types for decision with relations

---

## Build Status

✅ **Production build passes** (`npm run build`)
- Zero TypeScript errors
- All 9 dynamic pages render successfully
- 3 static pages (home, login, settings)

### Routes
```
○ / (Static)
○ /decisions (Static)
ƒ /decisions/[id] (Dynamic)
ƒ /decisions/[id]/governance (Dynamic)
ƒ /decisions/[id]/recommendation (Dynamic)
ƒ /decisions/[id]/report (Dynamic)
ƒ /decisions/[id]/simulation (Dynamic)
ƒ /decisions/[id]/tender (Dynamic)
○ /decisions/new (Static)
○ /login (Static)
○ /organizations (Static - mock)
ƒ /organizations/[id] (Dynamic - mock)
○ /settings (Static - mock)
```

---

## Seed Data

File: `prisma/seed.js` (JavaScript for v7 compatibility)

### Demo Decision
- **Title**: Non-Profit Training & Empowerment Tender - 1,000 Beneficiaries
- **Client**: Social Development Non-Profit Organization
- **Contract Value**: SAR 2,800,000
- **Estimated Cost**: SAR 2,460,000
- **Duration**: 4 months
- **Margin**: 12.1%
- **Strategic Fit**: 90/100
- **Risk Level**: LOW

### Results
- Best Case: 93.2
- Expected Case: 83.0
- Worst Case: 71.0
- **Recommendation**: GO_WITH_CONDITIONS

### Users
- Admin: Ahmed Al-Mansouri (admin@aqliya.com)
- Reviewer: Sara Al-Otaibi (sara@aqliya.com)
- Approver: Mohammad Al-Harbi (mohammad@aqliya.com)
