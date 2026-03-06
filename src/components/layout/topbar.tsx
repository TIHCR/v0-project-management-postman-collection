'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from './notification-dropdown';
import { UserMenu } from './user-menu';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
      <div className="flex items-center gap-4 flex-1">
        {title && (
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        )}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
