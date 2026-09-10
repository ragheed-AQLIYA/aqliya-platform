import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { localContentProductContent } from "@/lib/marketing/product-pages-content";
import { buildAlternates } from "@/lib/marketing/seo";

export function generateMetadata(): Metadata {
  const base = localContentProductContent.metadata;
  return {
    ...base,
    alternates: buildAlternates("/products/local-content"),
  };
}

export default function LocalContentProductPage() {
  return <ProductPageTemplate content={localContentProductContent} />;
}
