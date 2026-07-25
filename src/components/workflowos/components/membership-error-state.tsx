export function MembershipErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center text-sm text-status-error">
      {message}
    </div>
  );
}
