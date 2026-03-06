'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '@/services';
import { useWorkspaceStore } from '@/store';
import type { CreateWorkspaceRequest, CreateBoardRequest, InviteMemberRequest } from '@/types';
import { toast } from 'sonner';

export function useWorkspaces() {
  const queryClient = useQueryClient();
  const { setWorkspaces, setCurrentWorkspace, addWorkspace, currentWorkspace } = useWorkspaceStore();

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.create(data),
    onSuccess: (workspace) => {
      addWorkspace(workspace);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create workspace');
    },
  });

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    createWorkspace: createMutation.mutate,
    isCreating: createMutation.isPending,
    setCurrentWorkspace,
  };
}

export function useWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  const { setCurrentWorkspace } = useWorkspaceStore();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const data = await workspaceService.getById(workspaceId);
      setCurrentWorkspace(data);
      return data;
    },
    enabled: !!workspaceId,
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery({
    queryKey: ['workspace-boards', workspaceId],
    queryFn: () => workspaceService.getBoards(workspaceId),
    enabled: !!workspaceId,
  });

  const createBoardMutation = useMutation({
    mutationFn: (data: Omit<CreateBoardRequest, 'workspaceId'>) =>
      workspaceService.createBoard(workspaceId, { ...data, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-boards', workspaceId] });
      toast.success('Board created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create board');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberRequest) =>
      workspaceService.createInvite(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Invitation sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  return {
    workspace,
    members,
    boards,
    isLoading,
    isLoadingMembers,
    isLoadingBoards,
    createBoard: createBoardMutation.mutate,
    isCreatingBoard: createBoardMutation.isPending,
    inviteMember: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
}
