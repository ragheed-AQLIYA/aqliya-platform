"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowUpDown,
  Search,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { TrialBalanceUpload } from "@/components/audit/trial-balance/trial-balance-upload";
import type { TrialBalance, TrialBalanceLine, Engagement } from "@/types/audit";
import {
  getTrialBalanceAction,
  getEngagementAction,
} from "@/actions/audit-read-actions";

const sar = (v: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(v);

const trustColors: Record<string, string> = {
  trusted: "bg-green-100 text-green-800 border-green-300",
  conditional: "bg-amber-100 text-amber-800 border-amber-300",
  blocked: "bg-red-100 text-red-800 border-red-300",
};
const typeColors: Record<string, string> = {
  asset: "text-blue-600",
  "non-current-asset": "text-blue-600",
  liability: "text-orange-600",
  equity: "text-green-600",
  revenue: "text-teal-600",
  expense: "text-red-600",
};
const TrustIcon = ({ state }: { state: string }) =>
  state === "trusted" ? (
    <CheckCircle className="size-4" />
  ) : state === "conditional" ? (
    <AlertTriangle className="size-4" />
  ) : (
    <XCircle className="size-4" />
  );

export default function TrialBalancePage() {
  const t = useTranslations("audit.trialBalance");
  const params = useParams();
  const engagementId = params.engagementId as string;
  const [tb, setTb] = useState<TrialBalance | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<string>("accountCode");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    Promise.all([
      getTrialBalanceAction(engagementId),
      getEngagementAction(engagementId),
    ]).then(([t, e]) => {
      setTb(t);
      setEngagement(e);
      setLoading(false);
    });
  }, [engagementId]);

  const handleUploadComplete = () => {
    getTrialBalanceAction(engagementId).then(setTb);
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!tb)
    return (
      <div className="space-y-4">
        <Card className="rounded-[24px] border-border/70 shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            {t("notFound")}
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="size-4 me-1" />
            {t("uploadButton")}
          </Button>
        </div>
        <TrialBalanceUpload
          open={showUpload}
          onClose={() => setShowUpload(false)}
          engagementId={engagementId}
          onComplete={handleUploadComplete}
        />
      </div>
    );

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = tb.lines.filter(
    (l) =>
      l.accountName.toLowerCase().includes(search.toLowerCase()) ||
      l.accountCode.includes(search),
  );
  const sorted = [...filtered].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const av = (a as any)[sortKey],
      bv = (b as any)[sortKey];
    if (typeof av === "number" && typeof bv === "number")
      return sortAsc ? av - bv : bv - av;
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const SortHeader = ({
    k,
    children,
  }: {
    k: string;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => toggleSort(k)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="size-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <TrialBalanceUpload
        open={showUpload}
        onClose={() => setShowUpload(false)}
        engagementId={engagementId}
        onComplete={handleUploadComplete}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {engagement?.client?.name} - {engagement?.fiscalPeriod}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="size-4 me-1" />
          {t("upload")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <FileSpreadsheet className="size-4" />
        <span>
          {tb.sourceFile} {t("uploaded")}{" "}
          {new Date(tb.importTimestamp).toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <CardTitle>{t("accounts")}</CardTitle>
            <Badge
              variant="outline"
              className={`${trustColors[tb.trustState]} flex items-center gap-1`}
            >
              <TrustIcon state={tb.trustState} />
              {tb.trustState}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              {t("totalDebits")}{" "}
              <span className="font-medium">{sar(tb.totalDebits)}</span>
            </div>
            <div>
              {t("totalCredits")}{" "}
              <span className="font-medium">{sar(tb.totalCredits)}</span>
            </div>
            {tb.variance !== 0 && (
              <div className="flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="size-4" />
                {t("variance")} {sar(tb.variance)}
              </div>
            )}
            {tb.variance === 0 && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="size-4" />
                {t("inBalance")}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader k="accountCode">{t("accountCode")}</SortHeader>
                  <SortHeader k="accountName">{t("accountName")}</SortHeader>
                  <SortHeader k="debitAmount">{t("debit")}</SortHeader>
                  <SortHeader k="creditAmount">{t("credit")}</SortHeader>
                  <SortHeader k="balance">{t("balance")}</SortHeader>
                  <TableHead>{t("type")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((line) => (
                  <Fragment key={line.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === line.id ? null : line.id)
                      }
                    >
                      <TableCell className="font-mono">
                        {line.accountCode}
                      </TableCell>
                      <TableCell
                        className={typeColors[line.accountType || ""] || ""}
                      >
                        {line.accountName}
                      </TableCell>
                      <TableCell>
                        {line.debitAmount > 0 ? sar(line.debitAmount) : "-"}
                      </TableCell>
                      <TableCell>
                        {line.creditAmount > 0 ? sar(line.creditAmount) : "-"}
                      </TableCell>
                      <TableCell
                        className={line.balance < 0 ? "text-red-600" : ""}
                      >
                        {sar(line.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={typeColors[line.accountType || ""] || ""}
                        >
                          {line.accountType || t("unknown")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {expandedRow === line.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="p-3 text-sm space-y-1">
                            <div className="font-medium">
                              {line.accountName} ({line.accountCode})
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                              <div>
                                {t("debit")}: {sar(line.debitAmount)}
                              </div>
                              <div>
                                {t("credit")}: {sar(line.creditAmount)}
                              </div>
                              <div>
                                {t("balance")}: {sar(line.balance)}
                              </div>
                              <div>
                                {t("type")}: {line.accountType || t("unknown")}
                              </div>
                              <div>
                                {t("currency")}: {line.currency}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
