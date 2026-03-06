'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueries } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import type { Column, Task } from '@/types';
import { useBoard, useOptimisticBoard } from '@/hooks';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { CreateColumnModal } from './create-column-modal';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface KanbanBoardProps {
  boardId: string;
  onTaskClick: (task: Task) => void;
}

const fetchColumnTasks = async (columnId: string): Promise<Task[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'}/columns/${columnId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const json = await response.json();
  const payload = json?.data;
  // Normaliza independente do formato: array direto ou { tasks: [] }
  return Array.isArray(payload) ? payload : (payload?.tasks ?? payload?.items ?? []);
};

export function KanbanBoard({ boardId, onTaskClick }: KanbanBoardProps) {
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const {
    columns,
    isLoadingColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    isCreatingColumn,
  } = useBoard(boardId);

  const { moveTaskOptimistic, reorderColumnsOptimistic } = useOptimisticBoard(boardId);

  // useQueries busca todas as colunas em paralelo e mantém o estado sincronizado
  const taskQueries = useQueries({
  queries: columns.map((column) => ({
    queryKey: ['column-tasks', column.id],
    queryFn: async () => {
      const result = await taskService.getByColumn(column.id);
      return Array.isArray(result) ? result : (result?.tasks ?? result?.items ?? result?.data ?? []);
    },
    enabled: !!column.id,
    staleTime: 30_000,
  })),
});

  // Monta o mapa columnId -> Task[] a partir dos resultados — sempre arrays garantidos
  const columnTasks: Record<string, Task[]> = columns.reduce(
    (acc, column, index) => {
      const result = taskQueries[index];
      acc[column.id] = result?.data ?? [];
      return acc;
    },
    {} as Record<string, Task[]>
  );

  // Estado local para feedback visual durante drag (sem afetar o cache do React Query)
  const [localColumnTasks, setLocalColumnTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    setLocalColumnTasks(columnTasks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskQueries.map((q) => q.dataUpdatedAt).join(',')]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === 'task') setActiveTask(activeData.task);
    else if (activeData?.type === 'column') setActiveColumn(activeData.column);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveTask(null);
        setActiveColumn(null);
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === 'column' && overData?.type === 'column') {
        const activeIndex = columns.findIndex((c) => c.id === active.id);
        const overIndex = columns.findIndex((c) => c.id === over.id);
        if (activeIndex !== overIndex) {
          const newColumns = [...columns];
          const [moved] = newColumns.splice(activeIndex, 1);
          newColumns.splice(overIndex, 0, moved);
          await reorderColumnsOptimistic(newColumns.map((c, i) => ({ ...c, position: i })));
        }
      }

      if (activeData?.type === 'task') {
        const taskId = active.id as string;
        const task = activeData.task as Task;
        let targetColumnId: string;
        let position: number;

        if (overData?.type === 'task') {
          const overTask = overData.task as Task;
          targetColumnId = overTask.columnId;
          position = (localColumnTasks[targetColumnId] || []).findIndex(
            (t) => t.id === overTask.id
          );
        } else if (overData?.type === 'column') {
          targetColumnId = over.id as string;
          position = (localColumnTasks[targetColumnId] || []).length;
        } else {
          setActiveTask(null);
          return;
        }

        if (task.columnId !== targetColumnId || position !== task.position) {
          await moveTaskOptimistic(taskId, task.columnId, targetColumnId, position);
        }
      }

      setActiveTask(null);
      setActiveColumn(null);
    },
    [columns, localColumnTasks, moveTaskOptimistic, reorderColumnsOptimistic]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type !== 'task') return;

    const task = activeData.task as Task;
    let targetColumnId: string;

    if (overData?.type === 'column') {
      targetColumnId = over.id as string;
    } else if (overData?.type === 'task') {
      targetColumnId = (overData.task as Task).columnId;
    } else {
      return;
    }

    if (task.columnId !== targetColumnId) {
      setLocalColumnTasks((prev) => {
        const next = { ...prev };
        next[task.columnId] = (next[task.columnId] || []).filter((t) => t.id !== task.id);
        const target = [...(next[targetColumnId] || [])];
        if (!target.find((t) => t.id === task.id)) {
          target.push({ ...task, columnId: targetColumnId });
        }
        next[targetColumnId] = target;
        return next;
      });
    }
  }, []);

  const handleCreateColumn = (data: { name: string; color: string }) => {
    createColumn(data, { onSuccess: () => setShowCreateColumn(false) });
  };

  if (isLoadingColumns) {
    return (
      <div className="flex gap-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-80 h-96 rounded-xl shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-4 min-h-[calc(100vh-200px)]">
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns
                .sort((a, b) => a.position - b.position)
                .map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={(localColumnTasks[column.id] ?? []).sort(
                      (a, b) => a.position - b.position
                    )}
                    onTaskClick={onTaskClick}
                    onUpdateColumn={(data) => updateColumn({ columnId: column.id, data })}
                    onDeleteColumn={() => deleteColumn(column.id)}
                  />
                ))}
            </SortableContext>

            <div className="w-80 shrink-0">
              <Button
                variant="outline"
                className="w-full h-12 border-dashed"
                onClick={() => setShowCreateColumn(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging />}
        </DragOverlay>
      </DndContext>

      <CreateColumnModal
        open={showCreateColumn}
        onOpenChange={setShowCreateColumn}
        onSubmit={handleCreateColumn}
        isLoading={isCreatingColumn}
      />
    </>
  );
}