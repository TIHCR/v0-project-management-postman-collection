'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Upload, Paperclip, Download, Trash2, Loader2, FileText, Image, File } from 'lucide-react';
import type { Attachment } from '@/types';
import { taskService } from '@/services';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AttachmentUploaderProps {
  taskId: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function AttachmentUploader({ taskId }: AttachmentUploaderProps) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: () => taskService.getAttachments(taskId),
    enabled: !!taskId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => taskService.uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        files.forEach((file) => uploadMutation.mutate(file));
      }
    },
    [uploadMutation]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        files.forEach((file) => uploadMutation.mutate(file));
      }
      e.target.value = '';
    },
    [uploadMutation]
  );

  const handleDownload = (attachmentId: string) => {
    taskService.downloadAttachment(attachmentId);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Attachments</h4>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
      >
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: 10MB
            </p>
          </>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {isLoading ? (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No attachments yet
          </p>
        ) : (
          attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.mimeType);
            
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)} ·{' '}
                    {formatDistanceToNow(new Date(attachment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(attachment.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
