'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Users } from 'lucide-react';
import type { Workspace } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${workspace.id}`}>
      <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          <div className="h-24 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-foreground">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                {workspace.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {workspace.description}
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team
              </span>
              <span>
                Created {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
