import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { auditProductContent } from "@/lib/marketing/product-pages-content";
import { buildAlternates } from "@/lib/marketing/seo";

export function generateMetadata(): Metadata {
  const base = auditProductContent.metadata;
  return {
    ...base,
    alternates: buildAlternates("/products/audit"),
  };
}

export default function AuditProductPage() {
  return <ProductPageTemplate content={auditProductContent} />;
}
