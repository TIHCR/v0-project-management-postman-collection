'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Shield, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  userId: z.string().min(1, 'Selecione um membro'),
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER']),
});

type FormData = z.infer<typeof schema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface AddBoardMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  /** Membros do workspace que ainda não estão no board */
  availableMembers: WorkspaceMember[];
}

// ─── Role descriptions ────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  OWNER: {
    icon: Shield,
    label: 'Owner',
    description: 'Acesso total: editar, remover membros e deletar o board.',
  },
  EDITOR: {
    icon: Pencil,
    label: 'Editor',
    description: 'Pode criar e editar colunas e tarefas.',
  },
  VIEWER: {
    icon: Eye,
    label: 'Viewer',
    description: 'Apenas visualização, sem poder editar.',
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AddBoardMemberModal({
  open,
  onOpenChange,
  onSubmit: handleFormSubmit,
  isLoading,
  availableMembers,
}: AddBoardMemberModalProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'VIEWER' },
  });

  const role = watch('role');
  const userId = watch('userId');
  const RoleIcon = ROLE_CONFIG[role]?.icon ?? Eye;

  const onSubmit = (data: FormData) => {
    handleFormSubmit(data);
    reset();
  };

  const selectedMember = availableMembers.find((m) => m.id === userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adicionar ao Board
          </DialogTitle>
          <DialogDescription>
            Adicione um membro do workspace a este board com um papel específico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">

            {/* Seleção de membro */}
            <div className="space-y-2">
              <Label>Membro do Workspace</Label>
              <Select
                value={userId}
                onValueChange={(value) => setValue('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Todos os membros já estão no board.
                    </div>
                  ) : (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-destructive">{errors.userId.message}</p>
              )}
            </div>

            {/* Seleção de papel */}
            <div className="space-y-2">
              <Label>Papel no Board</Label>
              <Select
                value={role}
                onValueChange={(value: 'OWNER' | 'EDITOR' | 'VIEWER') =>
                  setValue('role', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Descrição do papel selecionado */}
              {role && (
                <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2">
                  <RoleIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {ROLE_CONFIG[role].description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); reset(); }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || availableMembers.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
