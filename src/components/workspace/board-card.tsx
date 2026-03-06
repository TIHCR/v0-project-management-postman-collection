'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Kanban, MoreHorizontal } from 'lucide-react';
import type { Board } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BoardCardProps {
  board: Board;
  workspaceId: string;
}

export function BoardCard({ board, workspaceId }: BoardCardProps) {
  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/board/${board.id}`} className="block">
          <div className="h-32 bg-gradient-to-br from-secondary/80 to-secondary flex items-center justify-center">
            <Kanban className="h-12 w-12 text-secondary-foreground" />
          </div>
        </Link>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <Link href={`/board/${board.id}`} className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {board.name}
              </h3>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {board.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {board.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
