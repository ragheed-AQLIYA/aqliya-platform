import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { auditProductContent } from "@/lib/marketing/product-pages-content";

export function generateMetadata(): Metadata {
  const base = auditProductContent.metadata;
  return {
    ...base,
    openGraph: {
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      url: "https://aqliya.com/products/audit",
      siteName: "AQLIYA",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-auditos.png",
          width: 1200,
          height: 630,
          alt: "AuditOS - نظام التدقيق والذكاء المالي | AQLIYA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      images: ["/og-auditos.png"],
    },
  };
}

export default function AuditProductPage() {
  return <ProductPageTemplate content={auditProductContent} />;
}
