"use client";

import { useMembershipManager } from "./components/use-membership-manager";
import { MembershipEmptyState } from "./components/membership-empty-state";
import { MembershipLoadingState } from "./components/membership-loading-state";
import { MembershipErrorState } from "./components/membership-error-state";
import { MembershipHeader } from "./components/membership-header";
import { AddMemberForm } from "./components/add-member-form";
import { MemberRow } from "./components/member-row";
import { EmptyMembersList } from "./components/empty-members-list";

export function WorkflowMembershipManager({
  clientId,
}: {
  clientId: string | null;
}) {
  const {
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
  } = useMembershipManager(clientId);

  if (!clientId) return <MembershipEmptyState />;
  if (loading) return <MembershipLoadingState />;
  if (loadError) return <MembershipErrorState message={loadError} />;

  return (
    <div className="space-y-4">
      <MembershipHeader
        clientName={clientName}
        showAdd={showAdd}
        onToggleAdd={() => setShowAdd(!showAdd)}
      />

      {showAdd && (
        <AddMemberForm
          email={email}
          role={role}
          adding={adding}
          error={error}
          onEmailChange={setEmail}
          onRoleChange={setRole}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      {memberships.length === 0 ? (
        <EmptyMembersList />
      ) : (
        <div className="space-y-2">
          {memberships.map((m) => (
            <MemberRow
              key={m.id}
              membership={m}
              onRoleChange={handleRoleChange}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
