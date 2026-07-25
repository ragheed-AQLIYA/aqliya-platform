"use client";

import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import type { ProductInfo } from "./use-organization-workspace";

function ProductCard({ product }: { product: ProductInfo }) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <product.icon className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">{product.nameAr}</div>
            <div className="text-[10px] text-muted-foreground">{product.name}</div>
          </div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.statusColor} ${product.statusBg}`}
        >
          {product.status}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{product.note}</p>

      <div className="flex items-center gap-2">
        <Link
          href={product.href}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          فتح {product.nameAr}
          <ArrowLeft className="h-3 w-3" />
        </Link>
        {product.adminHref && (
          <Link
            href={product.adminHref}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            إدارة {product.nameAr}
            <Settings className="h-3 w-3" />
          </Link>
        )}
      </div>

      {product.routeNote && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2">
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            {product.routeNote}
          </p>
        </div>
      )}
    </div>
  );
}

export function ProductsList({ products }: { products: ProductInfo[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">المنتجات المفعلة</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
