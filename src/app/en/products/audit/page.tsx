import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { auditProductContentEn } from "@/lib/marketing/product-pages-content-en";

export const metadata: Metadata = auditProductContentEn.metadata;

export default function EnglishAuditProductPage() {
  return (
    <ProductPageTemplate content={auditProductContentEn} locale="en" backHref="/en/products" />
  );
}
