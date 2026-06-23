import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { decisionProductContentEn } from "@/lib/marketing/product-pages-content-en";

export const metadata: Metadata = decisionProductContentEn.metadata;

export default function EnglishDecisionProductPage() {
  return (
    <ProductPageTemplate
      content={decisionProductContentEn}
      locale="en"
      backHref="/en/products"
    />
  );
}
