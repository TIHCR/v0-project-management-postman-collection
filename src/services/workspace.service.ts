import { apiClient } from '@/lib/api-client';
import type { 
  Workspace, 
  CreateWorkspaceRequest, 
  WorkspaceMember,
  Board,
  CreateBoardRequest,
  InviteMemberRequest,
  Invite
} from '@/types';

export const workspaceService = {
  // Workspaces
  async getAll(): Promise<Workspace[]> {
    return apiClient.get<Workspace[]>('/workspaces');
  },

  async getById(id: string): Promise<Workspace> {
    return apiClient.get<Workspace>(`/workspaces/${id}`);
  },

  async create(data: CreateWorkspaceRequest): Promise<Workspace> {
    return apiClient.post<Workspace>('/workspaces', data);
  },

  async update(id: string, data: Partial<CreateWorkspaceRequest>): Promise<Workspace> {
    return apiClient.put<Workspace>(`/workspaces/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/workspaces/${id}`);
  },

  // Members
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  },

  // Boards
  async getBoards(workspaceId: string): Promise<Board[]> {
    return apiClient.get<Board[]>(`/workspaces/${workspaceId}/boards`);
  },

  async createBoard(workspaceId: string, data: CreateBoardRequest): Promise<Board> {
    return apiClient.post<Board>(`/workspaces/${workspaceId}/boards`, data);
  },

  // Invites
  async createInvite(workspaceId: string, data: InviteMemberRequest): Promise<Invite> {
    return apiClient.post<Invite>(`/invites/${workspaceId}/invites`, data);
  },

  async getInvites(workspaceId: string): Promise<Invite[]> {
    return apiClient.get<Invite[]>(`/invites/${workspaceId}/invites`);
  },

  async acceptInvite(token: string): Promise<void> {
    return apiClient.get(`/invites/accept?token=${token}`);
  },
};
