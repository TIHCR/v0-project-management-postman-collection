'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CreateWorkspaceModal } from '@/components/modals/create-workspace-modal';

interface AppShellProps {
  children: React.ReactNode;
  workspaceId?: string;
  title?: string;
}

export function AppShell({ children, workspaceId, title }: AppShellProps) {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        workspaceId={workspaceId}
        onCreateWorkspace={() => setShowCreateWorkspace(true)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <CreateWorkspaceModal
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </div>
  );
}
