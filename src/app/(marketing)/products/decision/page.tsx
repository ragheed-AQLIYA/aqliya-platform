import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { decisionProductContent } from "@/lib/marketing/product-pages-content";

export const metadata: Metadata = decisionProductContent.metadata;

export default function DecisionProductPage() {
  return <ProductPageTemplate content={decisionProductContent} />;
}
