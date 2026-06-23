import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/marketing/v2/product-page-template";
import { auditProductContent } from "@/lib/marketing/product-pages-content";

export const metadata: Metadata = auditProductContent.metadata;

export default function AuditProductPage() {
  return <ProductPageTemplate content={auditProductContent} />;
}
