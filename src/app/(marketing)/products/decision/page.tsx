import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { decisionProductContent } from "@/lib/marketing/product-pages-content";

export function generateMetadata(): Metadata {
  const base = decisionProductContent.metadata;
  return {
    ...base,
    openGraph: {
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      url: "https://aqliya.com/products/decision",
      siteName: "AQLIYA",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-decisionos.png",
          width: 1200,
          height: 630,
          alt: "DecisionOS - نظام حوكمة القرارات | AQLIYA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      images: ["/og-decisionos.png"],
    },
  };
}

export default function DecisionProductPage() {
  return <ProductPageTemplate content={decisionProductContent} />;
}
