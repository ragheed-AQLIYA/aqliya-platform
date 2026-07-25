"use client"

interface MessagesDisplayProps {
  error: string
  success: string
}

export function MessagesDisplay({ error, success }: MessagesDisplayProps) {
  return (
    <>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}
    </>
  )
}
