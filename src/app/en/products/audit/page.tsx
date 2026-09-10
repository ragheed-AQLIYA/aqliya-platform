import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { auditProductContentEn } from "@/lib/marketing/product-pages-content-en";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  ...auditProductContentEn.metadata,
  alternates: buildAlternates("/en/products/audit"),
};

export default function EnglishAuditProductPage() {
  return (
    <ProductPageTemplate content={auditProductContentEn} locale="en" backHref="/en/products" />
  );
}
