import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/types';

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications');
  },

  async getUnread(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications?unread=true');
  },

  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.put('/notifications/read-all');
  },
};
