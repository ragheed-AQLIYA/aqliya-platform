"use client";

import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listSyncLogs } from "@/lib/sales/crm/actions";
import {
  AR,
  type SyncLogEntry,
  getStatusBadgeVariant,
  getStatusLabel,
  formatDate,
} from "./constants";

function SyncHistoryDialogContent({
  connectionId,
  organizationId,
  onClose,
}: {
  connectionId: string;
  organizationId: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listSyncLogs(organizationId, connectionId, 50)
      .then((data) => setLogs(data as unknown as SyncLogEntry[]))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [connectionId, organizationId]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{AR.syncHistory}</DialogTitle>
          <DialogDescription>{AR.details}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {AR.noSyncLogs}
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{AR.date}</TableHead>
                  <TableHead>{AR.resourceType}</TableHead>
                  <TableHead>{AR.status}</TableHead>
                  <TableHead>{AR.recordsTotal}</TableHead>
                  <TableHead>{AR.recordsCreated}</TableHead>
                  <TableHead>{AR.recordsUpdated}</TableHead>
                  <TableHead>{AR.recordsFailed}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpanded(expanded === log.id ? null : log.id)
                      }
                    >
                      <TableCell className="text-xs">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.resourceType}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(log.status)}
                          className="text-xs"
                        >
                          {getStatusLabel(log.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.totalRecords}
                      </TableCell>
                      <TableCell className="text-xs text-green-600">
                        {log.createdRecords}
                      </TableCell>
                      <TableCell className="text-xs text-blue-600">
                        {log.updatedRecords}
                      </TableCell>
                      <TableCell className="text-xs text-red-600">
                        {log.failedRecords}
                      </TableCell>
                    </TableRow>
                    {expanded === log.id && log.errorDetails ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="bg-muted/30 py-2"
                        >
                          <div className="rounded bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
                            {log.errorDetails}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {expanded === log.id && !log.errorDetails ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="bg-muted/30 py-2 text-center text-xs text-muted-foreground"
                        >
                          {AR.syncTriggered}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {AR.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SyncHistoryDialog({
  open,
  onOpenChange,
  connectionId,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  connectionId: string;
  organizationId: string;
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <SyncHistoryDialogContent
        key={connectionId}
        connectionId={connectionId}
        organizationId={organizationId}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
