"use client"

interface SelectCheckboxProps {
  id: string
  selected: boolean
  onToggle: (id: string) => void
}

export function SelectCheckbox({ id, selected, onToggle }: SelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={selected}
      onChange={() => onToggle(id)}
      className="h-4 w-4 rounded border-muted"
      aria-label="تحديد"
      onClick={(e) => e.stopPropagation()}
    />
  )
}
