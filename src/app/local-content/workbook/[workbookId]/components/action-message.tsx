interface Props {
  message: string | null;
}

export function ActionMessage({ message }: Props) {
  if (!message) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 text-sm p-3 rounded-lg">
      {message}
    </div>
  );
}
