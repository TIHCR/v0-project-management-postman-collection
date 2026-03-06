'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X, Trash2 } from 'lucide-react';
import type { Task, Priority, TaskStatus } from '@/types';
import { taskService } from '@/services';
import { CommentSection } from './comment-section';
import { AttachmentUploader } from './attachment-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MEDIUM: 'bg-secondary/20 text-secondary',
  HIGH: 'bg-accent/20 text-accent',
  URGENT: 'bg-destructive/20 text-destructive',
};

const statusColors: Record<string, string> = {
  TODO: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/20 text-primary',
  DONE: 'bg-secondary/20 text-secondary',
};

export function TaskModal({ task, open, onOpenChange }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const priority = watch('priority');
  const status = watch('status');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
      });
    }
  }, [task, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => taskService.update(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks'] });
      toast.success('Task updated successfully');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.delete(task!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-tasks'] });
      toast.success('Task deleted successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pr-8">
          <div className="space-y-2">
            {isEditing ? (
              <Input
                className="text-lg font-semibold -ml-3 h-auto py-1"
                {...register('title')}
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              <Badge className={cn('text-xs', statusColors[task.status])}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this task? This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="mt-4 space-y-6 h-full">
              {isEditing ? (
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={4}
                      placeholder="Add a description..."
                      {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={priority}
                        onValueChange={(value: Priority) =>
                          setValue('priority', value, { shouldDirty: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={status}
                        onValueChange={(value: TaskStatus) =>
                          setValue('status', value, { shouldDirty: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Priority
                      </h4>
                      <Badge className={cn('text-sm', priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Status
                      </h4>
                      <Badge className={cn('text-sm', statusColors[task.status])}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Created</h4>
                      <p className="text-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Updated</h4>
                      <p className="text-foreground">
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <CommentSection taskId={task.id} />
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <AttachmentUploader taskId={task.id} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
