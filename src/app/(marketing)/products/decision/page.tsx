import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { decisionProductContent } from "@/lib/marketing/product-pages-content";
import { buildAlternates } from "@/lib/marketing/seo";

export function generateMetadata(): Metadata {
  const base = decisionProductContent.metadata;
  return {
    ...base,
    alternates: buildAlternates("/products/decision"),
  };
}

export default function DecisionProductPage() {
  return <ProductPageTemplate content={decisionProductContent} />;
}
