'use client';

import { Crown, Shield, User } from 'lucide-react';
import type { WorkspaceMember } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberListProps {
  members: WorkspaceMember[];
  isLoading?: boolean;
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
};

export function MemberList({ members, isLoading }: MemberListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role];
          const initials = member.user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariants[member.role]} className="gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* Add member actions here */}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
