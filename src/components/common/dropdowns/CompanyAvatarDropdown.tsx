import React, { useEffect, useState } from 'react';
import { Plus, Warehouse, Users } from 'lucide-react';
import { CompanyAvatar, UserAvatar } from '@/components/common/avatars/Avatar';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import { getMyCompanyRoles } from '@/api/MyCompanyService';
import type { Role } from '@/types/role';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface CompanyAvatarDropdownProps {
  /** Custom trigger element; falls back to default Avatar */
  trigger?: React.ReactNode;
  onAddWarehouse: () => void;
  onSelectWarehouse: (warehouseId: string) => void;
  onSelectUser: (userId: string) => void;
  onSelectRole: (roleId: string) => void;
}

export function CompanyAvatarDropdown({
  trigger,
  onAddWarehouse,
  onSelectWarehouse,
  onSelectUser,
  onSelectRole,
}: CompanyAvatarDropdownProps) {
  const { myCompany, myWarehouses, myUsers } = useMyCompany();
  const [myRoles, setMyRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const resp = await getMyCompanyRoles();
        setMyRoles(resp.myRoles);
      } catch (err) {
        console.error('[CompanyAvatarDropdown] Failed to fetch roles', err);
      }
    }
    fetchRoles();
  }, []);

  return (
    <DropdownMenu>
      {/* Wrap trigger in a native button so Radix can attach listeners */}
      <DropdownMenuTrigger asChild>
        <button className="p-0 rounded-full focus:outline-none">
          {trigger ?? <CompanyAvatar mine withName variant="outline" size={32} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="right" className="w-48">
        <DropdownMenuLabel className="capitalize">
          {myCompany?.name || 'Company'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Warehouses Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between pr-2">
            <div className="flex items-center gap-2">
              <Warehouse size={16} />
              <span>Warehouses</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddWarehouse();
              }}
              className="p-1 rounded hover:bg-muted"
            >
              <Plus size={16} />
            </button>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {myWarehouses && myWarehouses.length > 0 ? (
              myWarehouses.map((wh) => (
                <DropdownMenuItem key={wh.id} onClick={() => onSelectWarehouse(wh.id)}>
                  <div className="flex items-center gap-2">
                    <Warehouse size={16} />
                    <span>{wh.name}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Warehouses</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Users Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Users size={16} />
            <span>Users</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {myUsers && myUsers.length > 0 ? (
              myUsers.map((user) => (
                <DropdownMenuItem key={user.id} onClick={() => onSelectUser(user.id)}>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      user={user}
                      mine={false}
                      withName={false}
                      variant="ghost"
                      size={24}
                      className="p-0"
                    />
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Users</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Roles Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Users size={16} />
            <span>Roles</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {myRoles.length > 0 ? (
              myRoles.map((role) => (
                <DropdownMenuItem key={role.id} onClick={() => onSelectRole(role.id)}>
                  {role.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Roles</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
