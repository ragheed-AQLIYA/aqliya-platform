import { useState, useEffect } from "react";
import {
  workflow_listMemberships,
  workflow_addMembershipByEmail,
  workflow_updateMembershipRole,
  workflow_updateMembershipStatus,
  workflow_getClient,
} from "@/actions/workflowos-actions";

export interface Membership {
  id: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
}

export function useMembershipManager(clientId: string | null) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Operator");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    Promise.all([
      workflow_listMemberships(clientId),
      workflow_getClient(clientId),
    ]).then(([membershipsRes, clientRes]) => {
      if (membershipsRes.success && membershipsRes.data) {
        setMemberships(membershipsRes.data as Membership[]);
      } else if (membershipsRes.error) {
        setLoadError(membershipsRes.error);
      }
      if (clientRes.success && clientRes.data) {
        setClientName((clientRes.data as { name: string }).name);
      }
      setLoading(false);
    });
  }, [clientId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !clientId) return;
    setAdding(true);
    setError(null);
    const r = await workflow_addMembershipByEmail({
      clientId,
      email: email.trim(),
      role,
    });
    setAdding(false);
    if (r.success) {
      setEmail("");
      setShowAdd(false);
      const m = await workflow_listMemberships(clientId);
      if (m.success && m.data) setMemberships(m.data as Membership[]);
    } else {
      setError(r.error ?? "فشل إضافة العضو");
    }
  }

  async function handleRoleChange(membershipId: string, newRole: string) {
    if (!clientId) return;
    await workflow_updateMembershipRole(membershipId, newRole);
    const m = await workflow_listMemberships(clientId);
    if (m.success && m.data) setMemberships(m.data as Membership[]);
  }

  async function handleToggleStatus(membership: Membership) {
    if (!clientId) return;
    const newStatus = membership.status === "Active" ? "Suspended" : "Active";
    await workflow_updateMembershipStatus(membership.id, newStatus);
    const m = await workflow_listMemberships(clientId);
    if (m.success && m.data) setMemberships(m.data as Membership[]);
  }

  return {
    memberships,
    clientName,
    loading,
    showAdd,
    email,
    role,
    adding,
    error,
    loadError,
    setShowAdd,
    setEmail,
    setRole,
    handleAdd,
    handleRoleChange,
    handleToggleStatus,
  };
}
