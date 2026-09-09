import type { Metadata } from "next";
import { publicOsStatusEn } from "@/lib/marketing/public-status"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "SalesOS  Commercial Intelligence | AQLIYA",
  description: "Pipeline management, deal tracking, account intelligence, and governed outreach for commercial teams.",
  alternates: buildAlternates("/en/products/sales"),
};

export default function SalesOSEnPage() {
  const s = publicOsStatusEn.salesOS;
  return (
    <main className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white/80 backdrop-blur-sm">
            {s.label}
          </span>
          <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">SalesOS</h1>
          <p className="mt-4 text-lg text-white/70">{s.capabilityNote}</p>
          <p className="mt-6 text-white/60">
            Pipeline, deals, accounts, intelligence, and governed outreach  coming on the platform roadmap.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/en/contact">
              <Button variant="secondary">Request early access</Button>
            </Link>
            <Link href="/en/products">
              <Button variant="outline" className="text-white">All systems</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
