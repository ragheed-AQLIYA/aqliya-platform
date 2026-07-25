import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { localContentProductContent } from "@/lib/marketing/product-pages-content";

export function generateMetadata(): Metadata {
  const base = localContentProductContent.metadata;
  return {
    ...base,
    openGraph: {
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      url: "https://aqliya.com/products/local-content",
      siteName: "AQLIYA",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-localcontentos.png",
          width: 1200,
          height: 630,
          alt: "LocalContentOS - نظام المحتوى المحلي | AQLIYA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: base.title ?? undefined,
      description: base.description ?? undefined,
      images: ["/og-localcontentos.png"],
    },
  };
}

export default function LocalContentProductPage() {
  return <ProductPageTemplate content={localContentProductContent} />;
}
