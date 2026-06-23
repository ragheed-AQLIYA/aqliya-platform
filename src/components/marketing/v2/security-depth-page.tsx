import Link from "next/link";
import type { SecurityControlRow, SecurityPillar } from "@/lib/marketing/security-page-content";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";

type SecurityDepthPageProps = {
  locale?: "ar" | "en";
  pillars: SecurityPillar[];
  controls: SecurityControlRow[];
  aiRules: string[];
  pdfLinks: Array<{ label: string; href: string }>;
};

const statusToneClass = {
  available: "text-emerald-500",
  planned: "text-amber-500",
  strategic: "text-muted-foreground",
};

export function SecurityDepthPage({
  locale = "ar",
  pillars,
  controls,
  aiRules,
  pdfLinks,
}: SecurityDepthPageProps) {
  const proofHref = locale === "en" ? "/en/proof" : "/proof";
  const deploymentHref = locale === "en" ? "/en/deployment" : "/deployment";
  const procurementHref = locale === "en" ? "/en/procurement-pack" : "/procurement-pack";
  const soc2Href = locale === "en" ? "/en/soc2-roadmap" : "/soc2-roadmap";

  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow={locale === "en" ? "Security" : "الأمن المؤسسي"}
        title={
          locale === "en"
            ? "Security is architecture — not an add-on"
            : "الأمن جزء من البنية — ليس إضافة لاحقة"
        }
        subtitle={
          locale === "en"
            ? "We do not claim SOC2 or ISO until earned. Transparent documentation and technical review sessions."
            : "لا ندّعي SOC2 أو ISO قبل اكتمالها. وثائق شفافة وجلسات مراجعة تقنية للمشتريات."
        }
        actions={
          <>
            <Link href={pdfLinks[0]?.href ?? "/print/security-summary"} className="btn-primary h-11 px-6">
              {pdfLinks[0]?.label}
            </Link>
            <ScheduleDiagnosticCta locale={locale} variant="outline" />
          </>
        }
      />

      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.id} className="rounded-xl border border-border/60 bg-background p-5">
                <h2 className="text-sm font-black">{p.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-14">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-black">
            {locale === "en" ? "Controls at a glance" : "ضوابط باختصار"}
          </h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-start">
                  <th className="px-4 py-3 font-semibold">
                    {locale === "en" ? "Area" : "المجال"}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "en" ? "Control" : "الضابط"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {controls.map((row) => (
                  <tr key={row.area} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.area}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.control}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {locale === "en" ? "AI governance" : "حوكمة الذكاء الاصطناعي"}
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {aiRules.map((rule) => (
              <li
                key={rule}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs"
              >
                {rule}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {pdfLinks.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="btn-outline h-10 px-4 text-sm">
                {link.label}
              </Link>
            ))}
            <Link href={soc2Href} className="btn-outline h-10 px-4 text-sm">
              {locale === "en" ? "SOC2 roadmap" : "خارطة SOC2"}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t py-10">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3 px-6">
          <Link href={procurementHref} className="btn-primary h-11 px-6">
            {locale === "en" ? "Procurement pack" : "حزمة المشتريات"}
          </Link>
          <Link href={proofHref} className="btn-outline h-11 px-6">
            {locale === "en" ? "Proof center" : "مركز الإثبات"}
          </Link>
          <Link href={deploymentHref} className="btn-outline h-11 px-6">
            {locale === "en" ? "Deployment options" : "بيئات النشر"}
          </Link>
        </div>
      </section>

      <ConversionBand
        title={
          locale === "en"
            ? "Security review for procurement"
            : "مراجعة أمنية لفريق المشتريات"
        }
        primaryHref={locale === "en" ? "/en/contact" : "/contact"}
        secondaryHref={proofHref}
        secondaryLabel={locale === "en" ? "Proof center" : "مركز الإثبات"}
      />
    </div>
  );
}
