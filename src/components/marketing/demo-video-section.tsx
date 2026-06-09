import Link from "next/link";
import { getDemoVideoEmbedUrl, getDemoVideoUrl } from "@/lib/marketing/demo-video";

type Props = {
  locale?: "ar" | "en";
};

export function DemoVideoSection({ locale = "ar" }: Props) {
  const rawUrl = getDemoVideoUrl();
  const embedUrl = rawUrl ? getDemoVideoEmbedUrl(rawUrl) : null;

  const copy =
    locale === "en"
      ? {
          eyebrow: "Executive demo (3 min)",
          title: "Prefer to watch before clicking through?",
          body: "Short guided overview for leadership — full interactive demo remains the primary proof path.",
          fallback: "Video coming soon — use the interactive demo below.",
          interactive: "Interactive demo",
        }
      : {
          eyebrow: "ديمو تنفيذي (٣ دقائق)",
          title: "تفضّل المشاهدة قبل التجربة التفاعلية؟",
          body: "ملخص قصير للقيادة — الديمو التفاعلي يبقى مسار الإثبات الأساسي.",
          fallback: "الفيديو قريباً — استخدم الديمو التفاعلي أدناه.",
          interactive: "الديمو التفاعلي",
        };

  return (
    <section className="border-b border-white/5 py-16">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          {copy.eyebrow}
        </p>
        <h2 className="mt-4 text-center text-2xl font-bold text-white">
          {copy.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
          {copy.body}
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {embedUrl ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={embedUrl}
                title={copy.eyebrow}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-sm text-slate-400">{copy.fallback}</p>
              <Link
                href="/auditos"
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {copy.interactive}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
