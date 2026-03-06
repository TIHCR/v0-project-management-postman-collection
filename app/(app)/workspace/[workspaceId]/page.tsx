'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Kanban } from 'lucide-react';
import { useWorkspace } from '@/hooks';
import { AppShell } from '@/components/layout';
import { BoardCard } from '@/components/workspace';
import { CreateBoardModal } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const { workspace, boards, isLoading, isLoadingBoards, createBoard, isCreatingBoard } =
    useWorkspace(workspaceId);

  const handleCreateBoard = (data: { name: string; description?: string }) => {
    createBoard(data, {
      onSuccess: () => setShowCreateBoard(false),
    });
  };

  if (isLoading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell workspaceId={workspaceId} title={workspace?.name}>
      <div className="max-w-7xl mx-auto space-y-8">
        <Tabs defaultValue="boards" className="space-y-6">
          <TabsList>
            <TabsTrigger value="boards">Boards</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="boards" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Boards</h2>
                <p className="text-sm text-muted-foreground">
                  {boards.length} board{boards.length !== 1 ? 's' : ''} in this workspace
                </p>
              </div>
              <Button onClick={() => setShowCreateBoard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            </div>

            {isLoadingBoards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 mb-4">
                  <Kanban className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No boards yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create your first board to start organizing tasks and tracking progress.
                </p>
                <Button onClick={() => setShowCreateBoard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first board
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.map((board) => (
                  <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Boards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{boards.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium text-foreground">
                    {workspace?.createdAt
                      ? new Date(workspace.createdAt).toLocaleDateString()
                      : '-'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {workspace?.description || 'No description provided'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateBoardModal
        open={showCreateBoard}
        onOpenChange={setShowCreateBoard}
        onSubmit={handleCreateBoard}
        isLoading={isCreatingBoard}
      />
    </AppShell>
  );
}
