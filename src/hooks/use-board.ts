'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardService, taskService } from '@/services';
import type { CreateColumnRequest, CreateTaskRequest, UpdateTaskRequest, Task, Column } from '@/types';
import { toast } from 'sonner';

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getById(boardId),
    enabled: !!boardId,
  });

  const { data: columns = [], isLoading: isLoadingColumns } = useQuery({
    queryKey: ['board-columns', boardId],
    queryFn: () => boardService.getColumns(boardId),
    enabled: !!boardId,
  });

  const createColumnMutation = useMutation({
    mutationFn: (data: CreateColumnRequest) => boardService.createColumn(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-columns', boardId] });
      toast.success('Column created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create column');
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: Partial<CreateColumnRequest> }) =>
      boardService.updateColumn(boardId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-columns', boardId] });
      toast.success('Column updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update column');
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => boardService.deleteColumn(boardId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-columns', boardId] });
      toast.success('Column deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete column');
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: (columns: Array<{ id: string; position: number }>) =>
      boardService.reorderColumns(boardId, { columns }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-columns', boardId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder columns');
    },
  });

  return {
    board,
    columns,
    isLoading,
    isLoadingColumns,
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    reorderColumns: reorderColumnsMutation.mutate,
    isCreatingColumn: createColumnMutation.isPending,
  };
}

export function useTasks(columnId: string) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['column-tasks', columnId],
    queryFn: () => taskService.getByColumn(columnId),
    enabled: !!columnId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks', columnId] });
      toast.success('Task created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      taskService.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, targetColumnId, position }: { taskId: string; targetColumnId: string; position: number }) =>
      taskService.moveTask(taskId, { targetColumnId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks', columnId] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  return {
    tasks,
    isLoading,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
  };
}

export function useOptimisticBoard(boardId: string) {
  const queryClient = useQueryClient();
  const { columns } = useBoard(boardId);

  const moveTaskOptimistic = async (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newPosition: number
  ) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['column-tasks'] });

    // Snapshot current state for rollback
    const previousSourceTasks = queryClient.getQueryData<Task[]>(['column-tasks', sourceColumnId]);
    const previousTargetTasks = queryClient.getQueryData<Task[]>(['column-tasks', targetColumnId]);

    // Optimistically update the cache
    if (sourceColumnId === targetColumnId) {
      queryClient.setQueryData<Task[]>(['column-tasks', sourceColumnId], (old = []) => {
        const taskIndex = old.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return old;
        
        const newTasks = [...old];
        const [task] = newTasks.splice(taskIndex, 1);
        newTasks.splice(newPosition, 0, { ...task, position: newPosition });
        return newTasks.map((t, i) => ({ ...t, position: i }));
      });
    } else {
      // Remove from source
      queryClient.setQueryData<Task[]>(['column-tasks', sourceColumnId], (old = []) =>
        old.filter(t => t.id !== taskId).map((t, i) => ({ ...t, position: i }))
      );

      // Add to target
      queryClient.setQueryData<Task[]>(['column-tasks', targetColumnId], (old = []) => {
        const task = previousSourceTasks?.find(t => t.id === taskId);
        if (!task) return old;
        
        const newTasks = [...old];
        newTasks.splice(newPosition, 0, { ...task, columnId: targetColumnId, position: newPosition });
        return newTasks.map((t, i) => ({ ...t, position: i }));
      });
    }

    try {
      await taskService.moveTask(taskId, { targetColumnId, position: newPosition });
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['column-tasks', sourceColumnId], previousSourceTasks);
      queryClient.setQueryData(['column-tasks', targetColumnId], previousTargetTasks);
      toast.error('Failed to move task');
    }
  };

  const reorderColumnsOptimistic = async (newColumns: Column[]) => {
    await queryClient.cancelQueries({ queryKey: ['board-columns', boardId] });

    const previousColumns = queryClient.getQueryData<Column[]>(['board-columns', boardId]);

    queryClient.setQueryData<Column[]>(['board-columns', boardId], newColumns);

    try {
      await boardService.reorderColumns(boardId, {
        columns: newColumns.map((c, i) => ({ id: c.id, position: i })),
      });
    } catch (error) {
      queryClient.setQueryData(['board-columns', boardId], previousColumns);
      toast.error('Failed to reorder columns');
    }
  };

  return {
    columns,
    moveTaskOptimistic,
    reorderColumnsOptimistic,
  };
}
