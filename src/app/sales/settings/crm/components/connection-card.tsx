import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import {
  AR,
  type ConnectionCard,
  getProviderLabel,
  getStatusBadgeVariant,
  getStatusLabel,
  getProviderColor,
  formatDate,
} from "./constants";

export function ConnectionCardItem({
  conn,
  syncingId,
  testingId,
  togglingId,
  onSync,
  onTest,
  onToggle,
  onShowHistory,
  onEdit,
  onDelete,
}: {
  conn: ConnectionCard;
  syncingId: string | null;
  testingId: string | null;
  togglingId: string | null;
  onSync: (id: string) => void;
  onTest: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onShowHistory: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="rounded-[20px] transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`border px-2 py-0.5 text-xs font-semibold ${getProviderColor(conn.provider)}`}
            >
              {getProviderLabel(conn.provider)}
            </Badge>
            <Badge
              variant={getStatusBadgeVariant(conn.lastSyncStatus)}
              className="text-xs"
            >
              {getStatusLabel(conn.lastSyncStatus)}
            </Badge>
          </div>
        </div>
        <CardTitle className="mt-2 text-base">{conn.label}</CardTitle>
        <CardDescription className="text-xs">
          {conn.syncEnabled ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <PlayCircle className="h-3 w-3" />
              {AR.syncEnabled}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <PauseCircle className="h-3 w-3" />
              {AR.syncDisabled}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>{AR.lastSync}</span>
            <span>
              {conn.lastSyncAt ? formatDate(conn.lastSyncAt) : AR.never}
            </span>
          </div>
          {conn.conflictPolicy ? (
            <div className="flex justify-between">
              <span>{AR.conflictPolicyLabel}</span>
              <span>
                {conn.conflictPolicy === "crm_wins"
                  ? AR.crmWins
                  : conn.conflictPolicy === "local_wins"
                    ? AR.localWins
                    : AR.manual}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSync(conn.id)}
            disabled={syncingId === conn.id}
          >
            {syncingId === conn.id ? (
              <RefreshCw className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="ml-1 h-3 w-3" />
            )}
            {AR.syncNow}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTest(conn.id)}
            disabled={testingId === conn.id}
          >
            <CheckCircle2 className="ml-1 h-3 w-3" />
            {AR.testConnection}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggle(conn.id, !conn.syncEnabled)}
            disabled={togglingId === conn.id}
          >
            {conn.syncEnabled ? (
              <PauseCircle className="ml-1 h-3 w-3" />
            ) : (
              <PlayCircle className="ml-1 h-3 w-3" />
            )}
            {conn.syncEnabled ? AR.disable : AR.enable}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShowHistory(conn.id)}
          >
            <ExternalLink className="ml-1 h-3 w-3" />
            {AR.showHistory}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(conn.id)}
          >
            <Edit3 className="ml-1 h-3 w-3" />
            {AR.edit}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(conn.id)}
          >
            <Trash2 className="ml-1 h-3 w-3" />
            {AR.delete}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
