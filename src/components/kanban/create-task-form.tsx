'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Priority } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type FormData = z.infer<typeof schema>;

interface CreateTaskFormProps {
  onSubmit: (data: { title: string; priority: Priority }) => void;
  isLoading?: boolean;
}

export function CreateTaskForm({ onSubmit, isLoading }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const priority = watch('priority');

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add task
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <Input
        placeholder="Task title..."
        autoFocus
        {...register('title')}
        className="bg-background"
      />
      {errors.title && (
        <p className="text-xs text-destructive">{errors.title.message}</p>
      )}
      
      <div className="flex items-center gap-2">
        <Select
          value={priority}
          onValueChange={(value: Priority) => setValue('priority', value)}
        >
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-1 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
