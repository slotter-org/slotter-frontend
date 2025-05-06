import React from 'react';
import { Badge } from 'lucide-react';
import { Role } from '@/types/role';
import { RoleAvatar } from '@/components/common/avatars/Avatar';
import { 
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface RoleSubDropdownProps {
  roles: Role[];
  onSelectRole: (roleId: string) => void;
}

export function RoleSubDropdown({
  roles,
  onSelectRole,
}: RoleSubDropdownProps) {
  const toShow = roles.slice(0, 5);
  const isScrollable = roles.length > 5;

  return (
    <DropdownMenuSub>
      {/* Trigger */}
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1">
        <Badge size={16} />
        <span>Roles</span>
      </DropdownMenuSubTrigger>

      {/* Content */}
      <DropdownMenuSubContent className="p-0 w-48">
        <div className={isScrollable ? 'max-h-48 overflow-y-auto' : ''}>
          {toShow.map((role) => (
            <DropdownMenuItem
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="px-2 py-1"
            >
              <div className="flex items-center gap-2 capitalize">
                <RoleAvatar
                  role={role}
                  variant={ghost}
                  size={16}
                  className="p-0"
                  withName={false}
                />
                <span>{role.name}</span>
              </div>
            </DropdownMenuItem>
          ))}

          {roles.length === 0 && (
            <DropdownMenuItem disabled className="px-2 py-1">
              No Roles
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
