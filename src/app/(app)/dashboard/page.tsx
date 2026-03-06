'use client';

import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useWorkspaces } from '@/hooks';
import { AppShell } from '@/components/layout';
import { WorkspaceCard } from '@/components/workspace';
import { CreateWorkspaceModal } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { workspaces, isLoading } = useWorkspaces();

  return (
    <AppShell title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Workspaces</h2>
            <p className="text-muted-foreground mt-1">
              Manage your workspaces and collaborate with your team
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>

        {/* Workspaces Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-24 w-full rounded-t-xl" />
                <div className="space-y-2 px-4 pb-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No workspaces yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first workspace to start organizing your projects and
              collaborating with your team.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </AppShell>
  );
}
