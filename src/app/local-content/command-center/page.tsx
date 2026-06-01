import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buildLocalContentCommandCenter } from "@/lib/local-content/command-center";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LocalContentCommandCenterPage() {
  const user = await getCurrentUser();
  const snapshot = await buildLocalContentCommandCenter(user.organizationId);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link
          href="/local-content"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← LocalContentOS
        </Link>
        <h1 className="mt-2 text-h2 font-black">مركز قيادة المحتوى</h1>
        <p className="text-sm text-muted-foreground">{snapshot.disclaimerAr}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric label="مشاريع" value={snapshot.projectCount} />
        <Metric label="قيد المراجعة" value={snapshot.inReview} />
        <Metric label="مسودة" value={snapshot.draft} />
      </div>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-base">المشاريع</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.projects.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className="text-primary hover:underline">
                  {p.name}
                </Link>
                {" — "}
                {p.status}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Link
        href="/local-content/calendar"
        className="text-sm text-primary hover:underline"
      >
        عرض التقويم التحريري ←
      </Link>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
