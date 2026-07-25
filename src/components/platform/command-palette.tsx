"use client"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import {
  useCommandPalette,
} from "./components/use-command-palette"
import {
  EntityResults,
  NavigateSection,
  ModuleSection,
  CreateSection,
  ReviewSection,
  RecentSection,
  SettingsSection,
} from "./components/command-palette-list"

export interface PlatformCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlatformCommandPalette({ open, onOpenChange }: PlatformCommandPaletteProps) {
  const {
    search,
    setSearch,
    handleAction,
    getModuleColor,
    entityCommands,
    navigateCommands,
    moduleCommands,
    createCommands,
    reviewCommands,
    settingsCommands,
    recentCmdList,
  } = useCommandPalette({ open, onOpenChange })

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search commands, entities, or navigate..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {search && <EntityResults commands={entityCommands} onSelect={handleAction} />}

        {!search && (
          <>
            <NavigateSection commands={navigateCommands} onSelect={handleAction} />
            <ModuleSection commands={moduleCommands} onSelect={handleAction} getModuleColor={getModuleColor} />
            <CreateSection commands={createCommands} onSelect={handleAction} />
            <ReviewSection commands={reviewCommands} onSelect={handleAction} />
            <RecentSection commands={recentCmdList} onSelect={handleAction} />
            <SettingsSection commands={settingsCommands} onSelect={handleAction} />
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
