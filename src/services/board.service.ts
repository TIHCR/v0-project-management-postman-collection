import { apiClient } from '@/lib/api-client';
import type { 
  Board, 
  Column, 
  CreateColumnRequest, 
  ReorderColumnsRequest 
} from '@/types';

export const boardService = {
  // Board
  async getById(boardId: string): Promise<Board> {
    return apiClient.get<Board>(`/boards/${boardId}`);
  },

  // Columns
  async getColumns(boardId: string): Promise<Column[]> {
    return apiClient.get<Column[]>(`/boards/${boardId}/columns`);
  },

  async createColumn(boardId: string, data: CreateColumnRequest): Promise<Column> {
    return apiClient.post<Column>(`/boards/${boardId}/columns`, data);
  },

  async updateColumn(boardId: string, columnId: string, data: Partial<CreateColumnRequest>): Promise<Column> {
    return apiClient.put<Column>(`/boards/${boardId}/columns/${columnId}`, data);
  },

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    return apiClient.delete(`/boards/${boardId}/columns/${columnId}`);
  },

  async reorderColumns(boardId: string, data: ReorderColumnsRequest): Promise<void> {
    return apiClient.put(`/boards/${boardId}/columns/reorder`, data);
  },
};
