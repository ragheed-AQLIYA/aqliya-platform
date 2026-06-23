import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import {
  roadmapProductCards,
  tier1ProductCards,
} from "@/lib/marketing/product-pages-content";

export const metadata: Metadata = {
  title: "أنظمة التشغيل | AQLIYA",
  description:
    "أنظمة تشغيل مؤسسية — AuditOS، DecisionOS، LocalContentOS — على نواة حوكمة واحدة.",
};

function ProductCard({
  card,
}: {
  card: (typeof tier1ProductCards)[number];
}) {
  return (
    <Link
      href={card.href}
      className={cn(
        "group flex flex-col rounded-2xl border p-6 transition-colors hover:border-primary/30",
        card.muted
          ? "border-border/50 bg-muted/20 opacity-80"
          : "border-border/70 bg-background",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-foreground group-hover:text-primary">
            {card.title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.subtitle}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
            card.muted
              ? "border-amber-500/25 text-amber-700"
              : "border-emerald-500/25 text-emerald-700",
          )}
        >
          {card.statusLabel}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{card.problem}</p>
      <span className="mt-5 text-sm font-semibold text-primary">استكشف ←</span>
    </Link>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow="Operating Systems"
        title="أنظمة تشغيل مؤسسية على نواة واحدة"
        subtitle="كل نظام يعالج مساراً محدداً — تدقيق، قرار، محتوى محلي — داخل نفس الحوكمة والأدلة والاعتماد البشري."
        actions={
          <Link href="/start" className="btn-primary h-11 px-8 text-sm">
            من أين تبدأ؟
          </Link>
        }
      />

      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
          أنظمة التشغيل الأساسية
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {tier1ProductCards.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700/80">
            خطوط خارطة المنصة
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            قدرات مشتركة أو نماذج أولية — تُناقش ضمن نطاق التفعيل المؤسسي.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {roadmapProductCards.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              كل نظام يعمل داخل Evidence Chain · RBAC · Audit Trail · اعتماد بشري
            </p>
            <div className="flex gap-3">
              <Link href="/governance" className="btn-outline h-9 px-4 text-xs">
                الحوكمة
              </Link>
              <Link href="/platform" className="btn-outline h-9 px-4 text-xs">
                Intelligence Core
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ConversionBand
        secondaryHref="/start"
        secondaryLabel="من أين تبدأ"
      />
    </div>
  );
}
