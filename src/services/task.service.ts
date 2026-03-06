import { apiClient } from '@/lib/api-client';
import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  Comment,
  CreateCommentRequest,
  Attachment
} from '@/types';

export const taskService = {
  // Tasks
  async getByColumn(columnId: string, filters?: { priority?: string; page?: number; limit?: number }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Task[]>(`/columns/${columnId}/tasks${query}`);
  },

  async create(columnId: string, data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>(`/columns/${columnId}/tasks`, data);
  },

  async update(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${taskId}`, data);
  },

  async delete(taskId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}`);
  },

  async moveTask(taskId: string, data: { targetColumnId: string; position: number }): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${taskId}`, data);
  },

  // Comments
  async getComments(taskId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
  },

  async createComment(taskId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>(`/tasks/${taskId}/comments`, data);
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Attachments
  async getAttachments(taskId: string): Promise<Attachment[]> {
    return apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`);
  },

  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    return apiClient.uploadFile<Attachment>(`/tasks/${taskId}/attachments`, file);
  },

  async downloadAttachment(attachmentId: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'}/attachments/${attachmentId}/download`;
    window.open(url + (token ? `?token=${token}` : ''), '_blank');
  },
};
