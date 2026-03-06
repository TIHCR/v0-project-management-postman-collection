'use client';

import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Column, Task, Priority } from '@/types';
import { useTasks } from '@/hooks';
import { TaskCard } from './task-card';
import { CreateTaskForm } from './create-task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface KanbanColumnProps {
  column: Column;
  onTaskClick: (task: Task) => void;
  onUpdateColumn: (data: { name: string }) => void;
  onDeleteColumn: () => void;
  tasks: Task[];
  isLoadingTasks?: boolean;
}

export function KanbanColumn({
  column,
  onTaskClick,
  onUpdateColumn,
  onDeleteColumn,
  tasks,
  isLoadingTasks,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const { createTask, isCreatingTask } = useTasks(column.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleNameSubmit = () => {
    if (name.trim() && name !== column.name) {
      onUpdateColumn({ name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleCreateTask = (data: { title: string; priority: Priority }) => {
    createTask(data);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        'flex flex-col w-80 shrink-0 rounded-xl bg-muted/50',
        isDragging && 'opacity-50'
      )}
    >
      {/* Column Header */}
      <div
        className="flex items-center gap-2 p-3 border-b border-border/50"
        style={{ borderLeftColor: column.color, borderLeftWidth: 3 }}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setName(column.name);
                setIsEditing(false);
              }
            }}
            autoFocus
            className="h-7 text-sm font-medium"
          />
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h3 className="font-medium text-foreground truncate">{column.name}</h3>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteColumn} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Column Content */}
      <div
        ref={setDroppableRef}
        className={cn(
          'flex-1 p-2 transition-colors',
          isOver && 'bg-primary/5'
        )}
      >
        <ScrollArea className="h-[calc(100vh-280px)]">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 p-1">
              {isLoadingTasks ? (
                <>
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>

      {/* Create Task */}
      <div className="p-2 border-t border-border/50">
        <CreateTaskForm onSubmit={handleCreateTask} isLoading={isCreatingTask} />
      </div>
    </div>
  );
}
