"use client";

import { useEffect, useState, useCallback } from "react";
import {
  workflow_getRecord,
  workflow_getClient,
  workflow_getUserRole,
} from "@/actions/workflowos-actions";

export interface RecordData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  type: string;
  createdById: string;
  createdAt: Date;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  archivedAt?: Date | null;
  clientId: string;
  documents?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    createdAt: Date;
  }>;
  reviews?: Array<{
    id: string;
    status: string;
    notes?: string | null;
    reviewerId: string;
    createdAt: Date;
  }>;
}

export function useWorkflowRecordDetail(clientId: string, recordId: string) {
  const [record, setRecord] = useState<RecordData | null>(null);
  const [clientName, setClientName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      workflow_getRecord(clientId, recordId),
      workflow_getUserRole(clientId),
    ]).then(([recordResult, roleResult]) => {
      if (recordResult.success && recordResult.data) {
        setRecord(recordResult.data as RecordData);
        workflow_getClient(clientId).then((clientResult) => {
          if (clientResult.success && clientResult.data) {
            setClientName((clientResult.data as { name: string }).name);
          }
        });
      } else {
        setError(recordResult.error ?? "فشل تحميل القضية");
      }
      if (roleResult.success) {
        setUserRole(roleResult.data as string | null);
      }
      setLoading(false);
    });
  }, [clientId, recordId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { record, clientName, userRole, loading, error, loadData };
}
