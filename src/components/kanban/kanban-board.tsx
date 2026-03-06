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
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import type { Column, Task } from '@/types';
import { useBoard, useOptimisticBoard, useTasks } from '@/hooks';
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

export function KanbanBoard({ boardId, onTaskClick }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [columnTasks, setColumnTasks] = useState<Record<string, Task[]>>({});

  const {
    columns,
    isLoadingColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    isCreatingColumn,
  } = useBoard(boardId);

  const { moveTaskOptimistic, reorderColumnsOptimistic } = useOptimisticBoard(boardId);

  // Fetch tasks for each column
  useEffect(() => {
    columns.forEach((column) => {
      queryClient.prefetchQuery({
        queryKey: ['column-tasks', column.id],
        queryFn: async () => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'}/columns/${column.id}/tasks`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            }
          );
          if (!response.ok) throw new Error('Failed to fetch tasks');
          return response.json();
        },
      });
    });
  }, [columns, queryClient]);

  // Subscribe to task data
  useEffect(() => {
    const tasks: Record<string, Task[]> = {};
    columns.forEach((column) => {
      const cachedTasks = queryClient.getQueryData<Task[]>(['column-tasks', column.id]) || [];
      tasks[column.id] = cachedTasks;
    });
    setColumnTasks(tasks);

    // Set up subscriptions
    const unsubscribes = columns.map((column) =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event.query.queryKey[0] === 'column-tasks' && event.query.queryKey[1] === column.id) {
          const data = queryClient.getQueryData<Task[]>(['column-tasks', column.id]);
          if (data) {
            setColumnTasks((prev) => ({ ...prev, [column.id]: data }));
          }
        }
      })
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [columns, queryClient]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'task') {
      setActiveTask(activeData.task);
    } else if (activeData?.type === 'column') {
      setActiveColumn(activeData.column);
    }
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

      // Handle column reordering
      if (activeData?.type === 'column' && overData?.type === 'column') {
        const activeIndex = columns.findIndex((c) => c.id === active.id);
        const overIndex = columns.findIndex((c) => c.id === over.id);

        if (activeIndex !== overIndex) {
          const newColumns = [...columns];
          const [movedColumn] = newColumns.splice(activeIndex, 1);
          newColumns.splice(overIndex, 0, movedColumn);
          await reorderColumnsOptimistic(newColumns.map((c, i) => ({ ...c, position: i })));
        }
      }

      // Handle task movement
      if (activeData?.type === 'task') {
        const taskId = active.id as string;
        const task = activeData.task as Task;
        
        let targetColumnId: string;
        let position: number;

        if (overData?.type === 'task') {
          const overTask = overData.task as Task;
          targetColumnId = overTask.columnId;
          const targetTasks = columnTasks[targetColumnId] || [];
          position = targetTasks.findIndex((t) => t.id === overTask.id);
        } else if (overData?.type === 'column') {
          targetColumnId = over.id as string;
          const targetTasks = columnTasks[targetColumnId] || [];
          position = targetTasks.length;
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
    [columns, columnTasks, moveTaskOptimistic, reorderColumnsOptimistic]
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
      // Update local state for visual feedback
      setColumnTasks((prev) => {
        const newState = { ...prev };
        // Remove from source
        newState[task.columnId] = (newState[task.columnId] || []).filter((t) => t.id !== task.id);
        // Add to target
        const targetTasks = [...(newState[targetColumnId] || [])];
        if (!targetTasks.find((t) => t.id === task.id)) {
          targetTasks.push({ ...task, columnId: targetColumnId });
        }
        newState[targetColumnId] = targetTasks;
        return newState;
      });
    }
  }, []);

  const handleCreateColumn = (data: { name: string; color: string }) => {
    createColumn(data, {
      onSuccess: () => setShowCreateColumn(false),
    });
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
                    tasks={(columnTasks[column.id] || []).sort((a, b) => a.position - b.position)}
                    onTaskClick={onTaskClick}
                    onUpdateColumn={(data) =>
                      updateColumn({ columnId: column.id, data })
                    }
                    onDeleteColumn={() => deleteColumn(column.id)}
                  />
                ))}
            </SortableContext>

            {/* Add Column Button */}
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
          {activeTask && (
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          )}
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
