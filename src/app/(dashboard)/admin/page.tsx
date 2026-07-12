import "server-only"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { isRedisAvailable } from "@/lib/platform/redis-client"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import * as fs from "fs"
import * as path from "path"
import { getSystemConfig, getPlatformStats, getSystemHealthSummary, checkDatabaseHealth } from "@/actions/admin-actions"
import { UsersTable } from "@/components/admin/users-table"

export const dynamic = "force-dynamic"

interface PkgJson {
  version?: string
}

function getVersion(): string {
  try {
    const pkgPath = path.join(process.cwd(), "package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PkgJson
    return pkg.version ?? "0.0.0"
  } catch {
    return "0.0.0"
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const FEATURE_FLAG_KEYS = [
  "ai.real-providers",
  "ai.cost-tracking",
  "ai.streaming",
  "ai.budget-quotas",
  "ai.rag",
  "ai.budget-alerts",
  "audit.mock-ai",
  "audit.intelligence",
  "audit.reporting-graph",
  "audit.lead-schedule-auto",
  "audit.reconciliation",
  "audit.reconciliation-gates",
  "audit.fs-v2",
  "audit.ifrs-rules",
  "audit.socpa-rules",
  "audit.disclosure-auto",
  "audit.approval-gates",
  "audit.mind-map",
  "platform.abac-shadow",
  "platform.abac-shadow-verbose",
  "platform.abac-enforce",
  "platform.event-outbox",
  "platform.event-schema-registry",
  "audit.isa-rules",
  "queue.enabled",
  "tenant.self-service",
  "tenant.lifecycle",
  "storage.s3-as-default",
]

const ENV_VARS_TO_CHECK = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "REDIS_URL",
  "STORAGE_PROVIDER",
  "SCANNER_PROVIDER",
  "AI_PROVIDER",
  "RATE_LIMITER",
  "AI_MODE",
  "CACHE_PREFIX",
]

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/access-denied")

  const { tab } = await searchParams
  const currentTab = tab ?? "dashboard"

  const version = getVersion()

  const envStatus: { key: string; set: boolean }[] = ENV_VARS_TO_CHECK.map(
    (key) => ({
      key,
      set: !!process.env[key],
    }),
  )

  const dbResult = await checkDatabaseHealth();
  const dbOk = dbResult.ok;
  const dbLatency = dbResult.latency;

  const redisStart = Date.now()
  let redisOk = false
  let redisConfigured = false
  let redisLatency = 0
  if (process.env.REDIS_URL) {
    redisConfigured = true
    try {
      redisOk = await isRedisAvailable()
      redisLatency = Date.now() - redisStart
    } catch {
      redisOk = false
      redisLatency = Date.now() - redisStart
    }
  }

  const featureFlags = FEATURE_FLAG_KEYS.map((key) => ({
    key,
    enabled: isEnabled(key),
  }))

  const tabs = [
    { key: "dashboard", label: "لوحة المعلومات" },
    { key: "users", label: "المستخدمون" },
    { key: "system", label: "النظام" },
    { key: "logs", label: "سجل التدقيق" },
  ] as const

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-muted-foreground">
          مرحباً {user.name} — لوحة المعلومات والإشراف على المنصة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">إصدار المنصة</p>
          <p className="text-2xl font-bold font-mono" dir="ltr">
            v{version}
          </p>
        </div>

        <div className="rounded-lg border p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">المستخدم</p>
          <p className="text-lg font-bold truncate" dir="ltr">
            {user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.name} • {user.role}
          </p>
        </div>

        <div className="rounded-lg border p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">المؤسسة</p>
          <p className="text-lg font-bold truncate">{user.organization.name}</p>
          <p className="text-xs text-muted-foreground font-mono" dir="ltr">
            {user.organization.id}
          </p>
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 -mb-px" role="tablist">
          {tabs.map((t) => {
            const isActive = currentTab === t.key
            const href = t.key === "dashboard" ? "/admin" : `/admin?tab=${t.key}`
            return (
              <Link
                key={t.key}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {currentTab === "dashboard" && (
        <DashboardTab user={user} />
      )}

      {currentTab === "users" && (
        <UsersTab user={user} />
      )}

      {currentTab === "system" && (
        <SystemTab
          envStatus={envStatus}
          dbOk={dbOk}
          dbLatency={dbLatency}
          redisConfigured={redisConfigured}
          redisOk={redisOk}
          redisLatency={redisLatency}
          featureFlags={featureFlags}
        />
      )}

      {currentTab === "logs" && (
        <LogsTab user={user} />
      )}
    </main>
  )
}

async function DashboardTab({
  user,
}: {
  user: { organizationId: string }
}) {
  const [stats, config, health] = await Promise.all([
    getPlatformStats(user.organizationId),
    getSystemConfig(user.organizationId),
    getSystemHealthSummary(user.organizationId).catch(() => null),
  ])

  const statCards = [
    { label: "المستخدمون", value: stats.users },
    { label: "المؤسسات", value: stats.organizations },
    { label: "الارتباطات", value: stats.engagements },
    { label: "القرارات", value: stats.decisions },
    { label: "أحداث التدقيق", value: stats.auditEvents },
    { label: "ملفات الأدلة", value: stats.evidenceFiles },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {health && (
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4">صحة النظام</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الأحداث</p>
              <p className="text-2xl font-bold">{health.totalEvents}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">آخر 24 ساعة</p>
              <p className="text-2xl font-bold">{health.last24hEvents}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">أخطاء (24 ساعة)</p>
              <p className="text-2xl font-bold text-red-600">{health.recentErrors24h}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">المستخدمون النشطون</p>
              <p className="text-2xl font-bold">{health.activeUsers}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">إعدادات البيئة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">البيئة</span>
            <span className="font-mono" dir="ltr">{config.environment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">مزود التخزين</span>
            <span className="font-mono" dir="ltr">{config.storageProvider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ماسح الملفات</span>
            <span className="font-mono" dir="ltr">{config.scannerProvider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">محدد السرعة</span>
            <span className="font-mono" dir="ltr">{config.rateLimiter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">التتبع</span>
            <span>{config.tracing ? "مفعل" : "معطل"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

async function UsersTab({
  user,
}: {
  user: { organizationId: string }
}) {
  const { listUsers } = await import("@/actions/admin-actions")
  const { users } = await listUsers(user.organizationId)

  return (
    <div className="space-y-4">
      <UsersTable users={users} organizationId={user.organizationId} />
      <div className="text-center">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          الانتقال إلى صفحة إدارة المستخدمين الكاملة ←
        </Link>
      </div>
    </div>
  )
}

async function LogsTab({
  user,
}: {
  user: { organizationId: string }
}) {
  const { listAuditEvents: fetchAuditLogs } = await import("@/actions/admin-actions")
  let events: Array<{ id: string; action: string; createdAt: Date }> = []
  try {
    const result = await fetchAuditLogs(user.organizationId, 5, 0)
    events = result.events
  } catch {
    // fall through
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          لا توجد أحداث تدقيق مسجلة
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium">الوقت</th>
                <th className="p-3 text-right font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap text-xs text-muted-foreground" dir="ltr">
                    {event.createdAt.toLocaleString("ar-SA")}
                  </td>
                  <td className="p-3 font-medium">{event.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/admin/logs"
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          الانتقال إلى سجل التدقيق الكامل ←
        </Link>
      </div>
    </div>
  )
}

function SystemTab({
  envStatus,
  dbOk,
  dbLatency,
  redisConfigured,
  redisOk,
  redisLatency,
  featureFlags,
}: {
  envStatus: { key: string; set: boolean }[]
  dbOk: boolean
  dbLatency: number
  redisConfigured: boolean
  redisOk: boolean
  redisLatency: number
  featureFlags: { key: string; enabled: boolean }[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="rounded-lg border p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">المتغيرات البيئية</h2>
        <div className="space-y-2">
          {envStatus.map(({ key, set }) => (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-mono" dir="ltr">
                {key}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  set
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {set ? "مضبوط" : "غير مضبوط"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-lg border p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4">الاتصال بقاعدة البيانات</h2>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm" dir="ltr">
              PostgreSQL
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                dbOk
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {dbOk ? `متصل (${dbLatency}ms)` : "غير متصل"}
            </span>
          </div>
        </section>

        <section className="rounded-lg border p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4">الاتصال بـ Redis</h2>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm" dir="ltr">
              {redisConfigured ? process.env.REDIS_URL : "Redis"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                !redisConfigured
                  ? "bg-yellow-50 text-yellow-700"
                  : redisOk
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {!redisConfigured
                ? "غير مضبوط"
                : redisOk
                  ? `متصل (${redisLatency}ms)`
                  : "غير متصل"}
            </span>
          </div>
        </section>

        <section className="rounded-lg border p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4">السمات التفاعلية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featureFlags.map(({ key, enabled }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-mono truncate" dir="ltr">
                  {key}
                </span>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    enabled
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {enabled ? "فعال" : "معطل"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
