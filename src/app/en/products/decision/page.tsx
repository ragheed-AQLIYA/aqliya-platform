import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { decisionProductContentEn } from "@/lib/marketing/product-pages-content-en";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  ...decisionProductContentEn.metadata,
  alternates: buildAlternates("/en/products/decision"),
};

export default function EnglishDecisionProductPage() {
  return (
    <ProductPageTemplate
      content={decisionProductContentEn}
      locale="en"
      backHref="/en/products"
    />
  );
}
