// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: User;
  createdAt: string;
}

// Board types
export interface Board {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  columns?: Column[];
  createdAt: string;
  updatedAt: string;
}

// Column types
export interface Column {
  id: string;
  name: string;
  color: string;
  position: number;
  boardId: string;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

// Task types
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  position: number;
  columnId: string;
  assigneeId?: string;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

// Attachment types
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  taskId: string;
  uploadedById: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}

// Invite types
export interface Invite {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  workspaceId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  createdAt: string;
}

// API request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  workspaceId: string;
}

export interface CreateColumnRequest {
  name: string;
  color: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  targetColumnId?: string;
  position?: number;
}

export interface CreateCommentRequest {
  content: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface ReorderColumnsRequest {
  columns: Array<{ id: string; position: number }>;
}
