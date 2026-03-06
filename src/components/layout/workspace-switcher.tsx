'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '@/hooks';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface WorkspaceSwitcherProps {
  onCreateNew?: () => void;
}

export function WorkspaceSwitcher({ onCreateNew }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaces();

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      router.push(`/workspace/${workspaceId}`);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 py-2 h-auto text-left font-normal hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shrink-0">
              {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {currentWorkspace?.name || 'Select workspace'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search workspaces..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.id}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary font-medium text-xs mr-2">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{workspace.name}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      currentWorkspace?.id === workspace.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onCreateNew?.();
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
