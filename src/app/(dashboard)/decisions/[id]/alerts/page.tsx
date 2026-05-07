"use client";

import { useCallback, useEffect, useState } from "react";
import { getAlertsAction, acknowledgeAlertAction, resolveAlertAction } from "@/actions/decision-signals-alerts";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Alert = {
  id: string;
  decisionId: string;
  triggeringSignalId: string;
  triggeringSignal: {
    id: string;
    signalType: string;
    description: string;
  };
  alertType: string;
  description: string;
  severity: string;
  status: string;
  requiresReview: boolean;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const severityColor: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColor: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  ACKNOWLEDGED: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function AlertsPage() {
  const params = useParams();
  const decisionId = params.id as string;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const loadAlerts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    const result = await getAlertsAction(decisionId);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setAlerts(result.data as unknown as Alert[]);
    }
    setLoading(false);
  }, [decisionId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadAlerts(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadAlerts]);

  async function handleAcknowledge(alertId: string) {
    const result = await acknowledgeAlertAction(decisionId, alertId);
    if (result.success) {
      loadAlerts();
    }
  }

  async function handleResolve(alertId: string) {
    if (!resolutionText.trim()) return;
    const result = await resolveAlertAction(decisionId, alertId, resolutionText);
    if (result.success) {
      setResolutionText("");
      loadAlerts();
    }
  }

  if (loading) return <div className="p-6">Loading alerts...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Risk Alerts</h1>
      <p className="text-sm text-muted-foreground">
        Alerts require human review and are never auto-resolved. Each alert links to a triggering signal.
      </p>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No alerts found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{alert.alertType}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={severityColor[alert.severity] || ""}>
                      {alert.severity}
                    </Badge>
                    <Badge className={statusColor[alert.status] || ""}>
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{alert.description}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Triggered by: {alert.triggeringSignal.signalType}</p>
                  <p>Signal description: {alert.triggeringSignal.description}</p>
                  <p>Created: {format(new Date(alert.createdAt), "PPp")}</p>
                  {alert.reviewedAt && (
                    <p>
                      Reviewed at {format(new Date(alert.reviewedAt), "PPp")}
                      {alert.resolution && ` - Resolution: ${alert.resolution}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  {alert.status === "OPEN" && (
                    <Button size="sm" onClick={() => handleAcknowledge(alert.id)}>
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== "RESOLVED" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Alert</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm">Provide resolution details for this alert:</p>
                          <Input
                            placeholder="Resolution details..."
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                          />
                          <Button
                            onClick={() => handleResolve(alert.id)}
                            disabled={!resolutionText.trim()}
                          >
                            Confirm Resolution
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
