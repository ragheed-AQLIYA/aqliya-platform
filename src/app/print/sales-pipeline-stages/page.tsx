import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";
import {
  salesKpiTargets90Day,
  salesPipelineStages,
} from "@/lib/marketing/sales-pipeline";

export const metadata: Metadata = {
  title: "مسار المبيعات — PDF | AQLIYA",
  description: "مراحل pipeline وKPIs — للفريق الداخلي والمستثمرين.",
};

export default function PrintSalesPipelinePage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — RevOps · {generated}</p>
        <h1>مسار المبيعات — 90 يوم</h1>

        <h2>المراحل</h2>
        {salesPipelineStages.map((s) => (
          <section key={s.stage}>
            <h2>{s.stage}</h2>
            <p>
              {s.definition} · المالك: {s.owner} · SLA: {s.sla}
              <br />
              خروج: {s.exit}
            </p>
          </section>
        ))}

        <h2>أهداف 90 يوم (scorecard)</h2>
        <ul>
          {salesKpiTargets90Day.map((k) => (
            <li key={k.metric}>
              {k.metric}: {k.target}
            </li>
          ))}
        </ul>

        <footer className="print-footer">
          Internal operating model — not a customer SLA document.
        </footer>
      </article>
    </>
  );
}
