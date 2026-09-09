import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { localContentProductContentEn } from "@/lib/marketing/product-pages-content-en";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  ...localContentProductContentEn.metadata,
  alternates: buildAlternates("/en/products/local-content"),
};

export default function EnglishLocalContentProductPage() {
  return (
    <ProductPageTemplate
      content={localContentProductContentEn}
      locale="en"
      backHref="/en/products"
    />
  );
}
