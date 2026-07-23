"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MousePointerClick,
  Reply,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignStats {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  sentCount: number;
  openCount: number;
  openRate: number;
  replyCount: number;
  replyRate: number;
  bounceCount: number;
  meetingCount: number;
  lastEvent?: string;
  lastEventAt?: string;
}

export function OutreachDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from SmartLead/Apollo APIs
    // For now, show the structure with sample data
    const sample: CampaignStats[] = [
      {
        id: "camp-1",
        name: "حملة التواصل الأولي — الربع الثالث",
        status: "active",
        sentCount: 245,
        openCount: 182,
        openRate: 74.3,
        replyCount: 38,
        replyRate: 15.5,
        bounceCount: 12,
        meetingCount: 7,
        lastEvent: "EMAIL_REPLIED",
        lastEventAt: new Date().toISOString(),
      },
    ];
    setCampaigns(sample);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8" dir="rtl">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>جاري تحميل الحملات...</span>
      </div>
    );
  }

  const totals = campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.sentCount,
      opened: acc.opened + c.openCount,
      replied: acc.replied + c.replyCount,
      bounced: acc.bounced + c.bounceCount,
      meetings: acc.meetings + c.meetingCount,
    }),
    { sent: 0, opened: 0, replied: 0, bounced: 0, meetings: 0 },
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard
          icon={<Mail className="h-5 w-5 text-blue-500" />}
          label="مُرسل"
          value={totals.sent.toLocaleString()}
        />
        <KpiCard
          icon={<MousePointerClick className="h-5 w-5 text-green-500" />}
          label="مفتوح"
          value={totals.opened.toLocaleString()}
          sub={`${totals.sent > 0 ? ((totals.opened / totals.sent) * 100).toFixed(1) : 0}%`}
        />
        <KpiCard
          icon={<Reply className="h-5 w-5 text-purple-500" />}
          label="ردود"
          value={totals.replied.toLocaleString()}
          sub={`${totals.sent > 0 ? ((totals.replied / totals.sent) * 100).toFixed(1) : 0}%`}
        />
        <KpiCard
          icon={<CalendarCheck className="h-5 w-5 text-amber-500" />}
          label="اجتماعات"
          value={totals.meetings.toLocaleString()}
        />
        <KpiCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          label="مرتد"
          value={totals.bounced.toLocaleString()}
        />
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">الحملات النشطة</h3>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-4 w-4 ml-1" />
            حملة جديدة
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد حملات تواصل حتى الآن. اربط SmartLead أو Apollo للبدء.
            </CardContent>
          </Card>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <Badge
                    variant={
                      c.status === "active"
                        ? "default"
                        : c.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {c.status === "active"
                      ? "نشط"
                      : c.status === "completed"
                        ? "مكتمل"
                        : c.status === "paused"
                          ? "متوقف"
                          : "مسودة"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                  <Stat label="مُرسل" value={c.sentCount} />
                  <Stat label="مفتوح" value={`${c.openRate.toFixed(1)}%`} />
                  <Stat label="ردود" value={`${c.replyRate.toFixed(1)}%`} />
                  <Stat label="مرتد" value={c.bounceCount} />
                  <Stat label="اجتماعات" value={c.meetingCount} />
                  <Stat
                    label="آخر حدث"
                    value={c.lastEvent ?? "—"}
                    sub={
                      c.lastEventAt
                        ? new Date(c.lastEventAt).toLocaleTimeString("ar-SA")
                        : undefined
                    }
                  />
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div
                      className="bg-green-500"
                      style={{ width: `${(c.openCount / c.sentCount) * 100}%` }}
                    />
                    <div
                      className="bg-purple-500"
                      style={{ width: `${(c.replyCount / c.sentCount) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(c.bounceCount / c.sentCount) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">{icon}</div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
