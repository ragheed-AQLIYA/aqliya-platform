import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { localContentProductContent } from "@/lib/marketing/product-pages-content";

export const metadata: Metadata = localContentProductContent.metadata;

export default function LocalContentProductPage() {
  return <ProductPageTemplate content={localContentProductContent} />;
}
