'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MessageSquare, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MEDIUM: 'bg-secondary/20 text-secondary',
  HIGH: 'bg-accent/20 text-accent',
  URGENT: 'bg-destructive/20 text-destructive',
};

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commentCount = task.comments?.length || 0;
  const attachmentCount = task.attachments?.length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer hover:shadow-md transition-all duration-200 border-border/50',
        (isDragging || isSorting) && 'opacity-50 shadow-lg rotate-2'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {task.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </Badge>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                {commentCount}
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <Paperclip className="h-3 w-3" />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
