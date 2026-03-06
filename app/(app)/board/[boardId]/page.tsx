'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { Task } from '@/types';
import { useBoard } from '@/hooks';
import { AppShell } from '@/components/layout';
import { KanbanBoard } from '@/components/kanban';
import { TaskModal } from '@/components/task/task-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { board, isLoading } = useBoard(boardId);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-80 h-96 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      workspaceId={board?.workspaceId}
      title={board?.name}
    >
      <div className="-mx-6 -my-6">
        <KanbanBoard
          boardId={boardId}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      </div>

      <TaskModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </AppShell>
  );
}
