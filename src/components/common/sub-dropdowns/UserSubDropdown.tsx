import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { UserAvatar } from '@/components/common/avatars/Avatar';
import { User } from '@/types/user';
import { SearchBar } from '@/components/common/SearchBar';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface UserSubDropdownProps {
  users: User[];
  onSelectUser: (userId: string) => void;
}

export function UserSubDropdown({
  users,
  onSelectUser,
}: UserSubDropdownProps) {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const term = filter.toLowerCase();
    return users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }, [filter, users]);

  // Only show the first 5 when rendering; scroll if more than 5
  const toShow = filtered.slice(0, 5);
  const isScrollable = filtered.length > 5;

  return (
    <DropdownMenuSub>
      {/* Trigger */}
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1">
        <Users size={16} />
        <span>Users</span>
      </DropdownMenuSubTrigger>

      {/* Content */}
      <DropdownMenuSubContent className="p-0 w-48">
        {/* Sticky search header */}
        <div className="sticky top-0 z-10 bg-background px-2 py-1">
          <SearchBar
            value={filter}
            onChange={setFilter}
            onClear={() => setFilter('')}
            placeholder="Search users..."
            className="w-full"
          />
        </div>

        {/* User list: scrollable only if >5 */}
        <div className={isScrollable ? 'max-h-48 overflow-y-auto' : ''}>
          {toShow.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="px-2 py-1"
            >
              <div className="flex items-center gap-2 capitalize">
                <UserAvatar
                  user={user}
                  mine={false}
                  withName={false}
                  variant="ghost"
                  size={16}
                  className="p-0"
                />
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </DropdownMenuItem>
          ))}

          {filtered.length === 0 && (
            <DropdownMenuItem disabled className="px-2 py-1">
              No users found
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

