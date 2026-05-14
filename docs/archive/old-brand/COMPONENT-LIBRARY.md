# AQLIYA — Component Library Structure

## Directory Organization

```
src/
├── components/
│   ├── ui/                    # Primitive components
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.styles.ts
│   │   │   └── button.stories.tsx
│   │   ├── input/
│   │   ├── badge/
│   │   ├── card/
│   │   ├── table/
│   │   ├── chart/
│   │   ├── modal/
│   │   ├── tooltip/
│   │   ├── toast/
│   │   ├── skeleton/
│   │   ── icon/
│   │
│   ├── layout/                # Layout components
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   ├── container/
│   │   └── grid/
│   │
│   ├── dashboard/             # Dashboard-specific
│   │   ├── kpi-card/
│   │   ├── data-table/
│   │   ├── chart-container/
│   │   ├── filter-bar/
│   │   └── dashboard-layout/
│   │
│   ├── ai/                    # AI components
│   │   ├── ai-panel/
│   │   ├── ai-message/
│   │   ├── ai-indicator/
│   │   └── ai-insight-card/
│   │
│   ├── audit/                 # Audit components
│   │   ├── workflow-steps/
│   │   ├── evidence-panel/
│   │   ├── review-queue/
│   │   └── audit-trail/
│   │
│   └── forms/                 # Form components
│       ├── form-field/
│       ├── form-group/
│       └── form-layout/
│
├── hooks/
│   ├── use-theme.ts
│   ├── use-media-query.ts
│   └── use-intersection-observer.ts
│
├── utils/
│   ├── cn.ts                  # Class name utility
│   ├── format.ts              # Formatting utilities
│   └── validation.ts          # Validation utilities
│
└── styles/
    ├── globals.css
    ├── tokens.css             # Design tokens
    ── components/            # Component-specific styles
```

## Component Standards

### Button Component

```tsx
// Primary Button
<Button variant="primary" size="md">
  Primary Action
</Button>

// Secondary Button
<Button variant="secondary" size="md">
  Secondary Action
</Button>

// Ghost Button
<Button variant="ghost" size="md">
  Ghost Action
</Button>

// Destructive Button
<Button variant="destructive" size="md">
  Delete
</Button>

// Sizes: xs, sm, md, lg
// Variants: primary, secondary, ghost, destructive, outline
```

### Card Component

```tsx
// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Elevated Card
<Card elevated>...</Card>

// Interactive Card
<Card interactive>...</Card>
```

### Table Component

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge Component

```tsx
// Status Badges
<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">AI Generated</Badge>

// AI Badge
<Badge variant="ai">AI</Badge>
```

### AI Panel Component

```tsx
<AIPanel>
  <AIPanelHeader>
    <AIIndicator />
    <span>AI Assistant</span>
  </AIPanelHeader>
  <AIPanelBody>
    <AIMessage type="ai">
      Analysis complete. Here are the findings...
    </AIMessage>
    <AIMessage type="user">
      Can you explain further?
    </AIMessage>
  </AIPanelBody>
  <AIPanelInput placeholder="Ask AI..." />
</AIPanel>
```

## Implementation Checklist

### For Each Component

- [ ] Uses design tokens (no hardcoded values)
- [ ] Supports dark mode
- [ ] RTL compatible
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Responsive design
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Storybook documentation
- [ ] Unit tests
- [ ] Visual regression tests

### Performance Requirements

- [ ] Bundle size < 5KB per component
- [ ] Lazy loading for heavy components
- [ ] Tree-shakeable exports
- [ ] No unnecessary re-renders
- [ ] Optimized animations (GPU-accelerated)

## Usage Examples

### Dashboard Page

```tsx
import { DashboardLayout, KPICard, DataTable, ChartContainer } from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-6 mb-6">
        <KPICard
          label="Total Revenue"
          value="$1.2M"
          change="+12.5%"
          trend="positive"
        />
        <KPICard
          label="Active Users"
          value="24,521"
          change="+8.2%"
          trend="positive"
        />
        <KPICard
          label="Pending Reviews"
          value="142"
          change="-3.1%"
          trend="negative"
        />
        <KPICard
          label="AI Insights"
          value="89"
          change="+24.7%"
          trend="positive"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <ChartContainer className="col-span-2">
          {/* Main chart */}
        </ChartContainer>
        <ChartContainer>
          {/* Secondary chart */}
        </ChartContainer>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        pagination
        sorting
        filtering
      />
    </DashboardLayout>
  )
}
```

### Audit Workflow

```tsx
import { WorkflowSteps, EvidencePanel, ReviewQueue } from '@/components/audit'

export default function AuditPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <WorkflowSteps
        steps={[
          { label: 'Data Collection', status: 'complete' },
          { label: 'AI Analysis', status: 'in-progress' },
          { label: 'Human Review', status: 'pending' },
          { label: 'Report Generation', status: 'pending' },
          { label: 'Approval', status: 'pending' },
        ]}
      />

      <EvidencePanel
        evidence={evidenceList}
        onVerify={handleVerify}
      />

      <ReviewQueue
        items={reviewItems}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
```
