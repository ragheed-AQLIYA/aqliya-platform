"use client"

import { Fragment } from "react"
import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { History } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommandEntry } from "./use-command-palette"

interface SectionListProps {
  commands: CommandEntry[]
  onSelect: (cmd: CommandEntry) => void
}

interface ColoredSectionListProps extends SectionListProps {
  getModuleColor: (module?: string) => string
}

function SectionGroup({ heading, commands, children }: { heading: string; commands: CommandEntry[]; children: (cmd: CommandEntry) => React.ReactNode }) {
  if (commands.length === 0) return null
  return (
    <>
      <CommandGroup heading={heading}>
        {commands.map((cmd) => (
          <Fragment key={cmd.id}>{children(cmd)}</Fragment>
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  )
}

function DefaultItem({ cmd, onSelect }: { cmd: CommandEntry; onSelect: (cmd: CommandEntry) => void }) {
  return (
    <CommandItem onSelect={() => onSelect(cmd)}>
      <cmd.icon className="h-4 w-4 text-muted-foreground" />
      <span>{cmd.label}</span>
      {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
    </CommandItem>
  )
}

export function EntityResults({ commands, onSelect }: SectionListProps) {
  if (commands.length === 0) return null
  return (
    <>
      <CommandGroup heading="Entities">
        {commands.map((cmd) => (
          <CommandItem key={cmd.id} onSelect={() => onSelect(cmd)}>
            <cmd.icon className="h-4 w-4 text-muted-foreground" />
            <span>{cmd.label}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  )
}

export function NavigateSection({ commands, onSelect }: SectionListProps) {
  return (
    <SectionGroup heading="Navigate" commands={commands}>
      {(cmd) => <DefaultItem cmd={cmd} onSelect={onSelect} />}
    </SectionGroup>
  )
}

export function ModuleSection({ commands, onSelect, getModuleColor }: ColoredSectionListProps) {
  if (commands.length === 0) return null
  return (
    <>
      <CommandGroup heading="Switch Module">
        {commands.map((cmd) => (
          <CommandItem key={cmd.id} onSelect={() => onSelect(cmd)}>
            <cmd.icon className={cn("h-4 w-4", getModuleColor(cmd.module))} />
            <span>{cmd.label}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  )
}

export function CreateSection({ commands, onSelect }: SectionListProps) {
  return (
    <SectionGroup heading="Create" commands={commands}>
      {(cmd) => <DefaultItem cmd={cmd} onSelect={onSelect} />}
    </SectionGroup>
  )
}

export function ReviewSection({ commands, onSelect }: SectionListProps) {
  return (
    <SectionGroup heading="Review" commands={commands}>
      {(cmd) => (
        <CommandItem onSelect={() => onSelect(cmd)}>
          <cmd.icon className="h-4 w-4 text-muted-foreground" />
          <span>{cmd.label}</span>
        </CommandItem>
      )}
    </SectionGroup>
  )
}

export function RecentSection({ commands, onSelect }: SectionListProps) {
  if (commands.length === 0) return null
  return (
    <>
      <CommandGroup heading="Recent">
        {commands.map((cmd) => (
          <CommandItem key={cmd.id} onSelect={() => onSelect(cmd)}>
            <cmd.icon className="h-4 w-4 text-muted-foreground" />
            <span>{cmd.label}</span>
            <History className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  )
}

export function SettingsSection({ commands, onSelect }: SectionListProps) {
  if (commands.length === 0) return null
  return (
    <CommandGroup heading="Settings">
      {commands.map((cmd) => (
        <CommandItem key={cmd.id} onSelect={() => onSelect(cmd)}>
          <cmd.icon className="h-4 w-4 text-muted-foreground" />
          <span>{cmd.label}</span>
          {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
