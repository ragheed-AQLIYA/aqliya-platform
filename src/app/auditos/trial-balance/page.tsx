import { getDemoTrialBalance } from "../demo-data";
import { StepNav } from "../step-nav";
import {
  GuidedDemoPanel,
  InsightCallout,
  MetricCard,
} from "@/components/enterprise";

function formatSAR(n: number) {
  return n.toLocaleString("ar-SA") + " ر.س";
}

export default function AuditosTrialBalance() {
  const { trialBalance, lines } = getDemoTrialBalance();
  const totalDebits = lines.reduce((s, l) => s + l.debitAmount, 0);
  const totalCredits = lines.reduce((s, l) => s + l.creditAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          المرحلة 1 — استعراض البيانات
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">ميزان المراجعة</h1>
        <p className="mt-2 text-muted-foreground">
          نستعرض {lines.length} حسابًا ضمن ملف تجريبي ثابت مرفق مع هذا العرض،
          بدون رفع ملفات أو حفظ بيانات من الزائر.
        </p>
      </div>

      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ نسخة ثابتة من ميزان المراجعة تعرض الحسابات والأرصدة.",
          "لماذا هذا مهم؟ هذه هي البيانات الخام التي سيُبنى عليها كل شيء لاحقًا.",
          "ما المخرج؟ قائمة حسابات مصنفة مبدئيًا مع أرصدة المدين والدائن.",
          "ما القرار التالي؟ مراجعة التصنيف والانتقال إلى ربط الحسابات بالقوائم.",
        ]}
        className="mb-8"
      />

      <InsightCallout
        text="يعرض هذا السيناريو 22 حسابًا داخل ملف تجريبي ثابت. الفرق بين المدين والدائن صفر، لذا الميزان متوازن ضمن العرض."
        type="success"
        className="mb-8"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="إجمالي المدين" value={formatSAR(totalDebits)} />
        <MetricCard label="إجمالي الدائن" value={formatSAR(totalCredits)} />
        <MetricCard label="الفرق" value={formatSAR(trialBalance.variance)} />
      </div>

      <div className="mb-8 overflow-x-auto rounded-[24px] border border-border/70 shadow-sm">
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
                <td className="px-4 py-2.5 font-mono text-xs">
                  {line.accountCode}
                </td>
                <td className="px-4 py-2.5">{line.accountName}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {line.accountType === "asset" && "أصل"}
                  {line.accountType === "non-current-asset" && "أصل غير متداول"}
                  {line.accountType === "liability" && "التزام"}
                  {line.accountType === "equity" && "حقوق ملكية"}
                  {line.accountType === "revenue" && "إيراد"}
                  {line.accountType === "expense" && "مصروف"}
                </td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">
                  {line.debitAmount > 0
                    ? line.debitAmount.toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">
                  {line.creditAmount > 0
                    ? line.creditAmount.toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-2.5 text-left font-mono text-xs">
                  {formatSAR(line.balance)}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 bg-muted/20 font-bold">
              <td className="px-4 py-2.5" colSpan={3}>
                الإجمالي
              </td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">
                {totalDebits.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">
                {totalCredits.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-left font-mono text-xs">
                {formatSAR(trialBalance.variance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <StepNav current="/auditos/trial-balance" />
    </div>
  );
}
