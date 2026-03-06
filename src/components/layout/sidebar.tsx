'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Kanban,
  Settings,
  Users,
  FolderKanban,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks';
import { WorkspaceSwitcher } from './workspace-switcher';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  workspaceId?: string;
  onCreateWorkspace?: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
];

export function Sidebar({ workspaceId, onCreateWorkspace }: SidebarProps) {
  const pathname = usePathname();
  const { boards, isLoadingBoards, workspace } = useWorkspace(workspaceId || '');

  return (
    <aside className="flex flex-col w-64 border-r border-sidebar-border bg-sidebar h-screen">
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-sidebar-border">
        <WorkspaceSwitcher onCreateNew={onCreateWorkspace} />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Workspace Navigation */}
          {workspaceId && workspace && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Workspace
                  </span>
                </div>
                <nav className="space-y-1">
                  <Link
                    href={`/workspace/${workspaceId}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === `/workspace/${workspaceId}`
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <FolderKanban className="h-4 w-4" />
                    Overview
                  </Link>
                  <Link
                    href={`/workspace/${workspaceId}/members`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === `/workspace/${workspaceId}/members`
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Members
                  </Link>
                  <Link
                    href={`/workspace/${workspaceId}/settings`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === `/workspace/${workspaceId}/settings`
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </div>

              {/* Boards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Boards
                  </span>
                </div>
                <nav className="space-y-1">
                  {isLoadingBoards ? (
                    <>
                      <Skeleton className="h-9 w-full rounded-lg" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </>
                  ) : boards.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No boards yet
                    </p>
                  ) : (
                    boards.map((board) => {
                      const isActive = pathname === `/board/${board.id}`;
                      return (
                        <Link
                          key={board.id}
                          href={`/board/${board.id}`}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <Kanban className="h-4 w-4" />
                          <span className="truncate">{board.name}</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        </Link>
                      );
                    })
                  )}
                </nav>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
