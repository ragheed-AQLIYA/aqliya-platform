import { Card, CardContent } from "@/components/ui/card";

export function GraphEmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-3xl mb-2">🕸️</p>
        <p className="font-bold text-muted-foreground">لا توجد عقد في الرسم البياني</p>
        <p className="text-sm text-muted-foreground">
          ستظهر العقد هنا عند إنشاء روابط بين الكيانات عبر المنتجات
        </p>
      </CardContent>
    </Card>
  );
}
