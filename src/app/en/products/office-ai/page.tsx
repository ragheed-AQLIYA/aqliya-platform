import type { Metadata } from "next";
import { publicOsStatusEn } from "@/lib/marketing/public-status"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Office AI Assistant — Shared Institutional Assistant | AQLIYA",
  description: "A governed shared assistant for document tasks, report drafting, and meeting notes across the AQLIYA platform.",
};

export default function OfficeAIEnPage() {
  const s = publicOsStatusEn.officeAI;
  return (
    <main className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white/80 backdrop-blur-sm">
            {s.label}
          </span>
          <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">Office AI Assistant</h1>
          <p className="mt-4 text-lg text-white/70">{s.capabilityNote}</p>
          <p className="mt-6 text-white/60">
            Draft reports, summarize documents, analyze spreadsheets, outline presentations, capture meeting notes — with governance and human review.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/en/products">
              <Button variant="outline" className="text-white">All systems</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
