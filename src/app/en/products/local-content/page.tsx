import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { localContentProductContentEn } from "@/lib/marketing/product-pages-content-en";

export const metadata: Metadata = localContentProductContentEn.metadata;

export default function EnglishLocalContentProductPage() {
  return (
    <ProductPageTemplate
      content={localContentProductContentEn}
      locale="en"
      backHref="/en/products"
    />
  );
}
