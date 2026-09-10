import { getProductHealthMetrics } from "@/actions/monitoring-health-actions";

const statusConfig = {
  active: { color: "text-status-success", bg: "bg-status-success/10", labelAr: "نشط" },
  idle: { color: "text-muted-foreground", bg: "bg-muted/30", labelAr: "خامل" },
  degraded: { color: "text-status-warning", bg: "bg-status-warning/10", labelAr: "متدهور" },
} as const;

function ProductRow({
  product,
}: {
  product: {
    productKey: string;
    labelAr: string;
    recordCount: number;
    status: "active" | "idle" | "degraded";
    detail: string;
  };
}) {
  const config = statusConfig[product.status];

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.color}`} />
        <div>
          <p className="text-sm font-medium">{product.labelAr}</p>
          <p className="text-xs text-muted-foreground">{product.detail}</p>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
      >
        {config.labelAr}
      </span>
    </div>
  );
}

export async function ProductHealthPanel() {
  const products = await getProductHealthMetrics();
  const activeCount = products.filter((p) => p.status === "active").length;
  const totalRecords = products.reduce((sum, p) => sum + p.recordCount, 0);

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">صحة المنتجات</h2>
        <p className="text-sm text-muted-foreground">
          حالة كل منتج على المنصة — نشط / خامل / متدهور
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-2xl font-black text-status-success">{activeCount}</p>
          <p className="text-xs text-muted-foreground">منتجات نشطة</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-2xl font-black">{products.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي المنتجات</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-2xl font-black text-module-audit">
            {totalRecords.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground">إجمالي السجلات</p>
        </div>
      </div>

      <div className="space-y-2">
        {products.map((product) => (
          <ProductRow key={product.productKey} product={product} />
        ))}
      </div>
    </section>
  );
}
