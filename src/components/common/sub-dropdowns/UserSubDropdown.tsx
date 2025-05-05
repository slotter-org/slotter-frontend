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
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((u) => 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1">
        <Users size={16} />
        <span>Users</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-0 w-60">
        {/* Sticky Search Header */}
        <div className="sticky top-0 bg-background px-2 py-1">
          <SearchBar
            value={filter}
            onChange={setFilter}
            onClear={() => setFilter('')}
            placeholder="Search Users..."
          />
        </div>
        {/* Scrollable list (max 5 items tall) */}
        <div className="max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => onSelectUser(user.id)}
              >
                <div className="flex items-center gap-2">
                  <UserAvatar
                    user={user}
                    mine={false}
                    withName={false}
                    variant="ghost"
                    size={16}
                    className="p-0"
                  />
                  <span>{user.firstName} {user.lastName}</span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No Users</DropdownMenuItem>
          )}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
