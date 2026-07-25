"use client";

interface Props {
  actionMsg: string | null;
  actionError: string | null;
}

export function VersionStatusMessages({ actionMsg, actionError }: Props) {
  return (
    <>
      {actionMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </div>
      )}
    </>
  );
}
