import { getDemoTrialBalance } from "@/lib/audit/demo-data"
import { StepNav } from "../step-nav"

function formatSAR(n: number) {
  return n.toLocaleString("ar-SA") + " ر.س"
}

export default function AuditosTrialBalance() {
  const { trialBalance, lines } = getDemoTrialBalance()
  const totalDebits = lines.reduce((s, l) => s + l.debitAmount, 0)
  const totalCredits = lines.reduce((s, l) => s + l.creditAmount, 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="space-y-2 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">المرحلة 1</p>
        <h1 className="text-2xl font-bold">ميزان المراجعة</h1>
        <p className="text-muted-foreground">
          تم استيراد {lines.length} حسابًا من ملف Excel — gulf_trading_tb_fy2025.xlsx
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs text-muted-foreground">إجمالي المدين</p>
          <p className="mt-1 text-xl font-bold text-green-600">{formatSAR(totalDebits)}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs text-muted-foreground">إجمالي الدائن</p>
          <p className="mt-1 text-xl font-bold text-red-600">{formatSAR(totalCredits)}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs text-muted-foreground">الفرق</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{formatSAR(trialBalance.variance)}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">رمز الحساب</th>
              <th className="px-4 py-3 text-right">اسم الحساب</th>
              <th className="px-4 py-3 text-right">النوع</th>
              <th className="px-4 py-3 text-left">مدين (ر.س)</th>
              <th className="px-4 py-3 text-left">دائن (ر.س)</th>
              <th className="px-4 py-3 text-left">الرصيد (ر.س)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-xs">{line.accountCode}</td>
                <td className="px-4 py-2.5">{line.accountName}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {line.accountType === "asset" && "أصل"}
                  {line.accountType === "non-current-asset" && "أصل غير متداول"}
                  {line.accountType === "liability" && "التزام"}
                  {line.accountType === "equity" && "حقوق ملكية"}
                  {line.accountType === "revenue" && "إيراد"}
                  {line.accountType === "expense" && "مصروف"}
                </td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">{line.debitAmount > 0 ? line.debitAmount.toLocaleString() : "-"}</td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">{line.creditAmount > 0 ? line.creditAmount.toLocaleString() : "-"}</td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">{formatSAR(line.balance)}</td>
              </tr>
            ))}
            <tr className="border-t-2 bg-muted/20 font-bold">
              <td className="px-4 py-2.5" colSpan={3}>الإجمالي</td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">{totalDebits.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">{totalCredits.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">{formatSAR(trialBalance.variance)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <StepNav current="/auditos/trial-balance" />
    </div>
  )
}
