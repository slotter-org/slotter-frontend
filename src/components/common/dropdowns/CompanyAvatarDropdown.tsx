import React, { useEffect, useState } from 'react';
import { Plus, Warehouse, Users } from 'lucide-react';
import { CompanyAvatar, UserAvatar } from '@/components/common/avatars/Avatar';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import { getMyCompanyRoles } from '@/api/MyCompanyService';
import { UserSubDropdown } from '@/components/common/sub-dropdowns/UserSubDropdown';
import { RoleSubDropdown } from '@/components/common/sub-dropdowns/RoleSubDropdown';
import { InvitationSubDropdown } from '@/components/common/sub-dropdowns/InvitationSubDropdown';
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
  onSelectInvitation: (invitationId: string) => void;
}

export function CompanyAvatarDropdown({
  trigger,
  onAddWarehouse,
  onSelectWarehouse,
  onSelectUser,
  onSelectRole,
  onSelectInvitation,
}: CompanyAvatarDropdownProps) {
  const { myCompany, myWarehouses, myUsers, myRoles, myInvitations } = useMyCompany();

  return (
    <DropdownMenu>
      {/* Wrap trigger in a native button so Radix can attach listeners */}
      <DropdownMenuTrigger asChild>
        <button className="p-0 rounded-full focus:outline-none">
          {trigger ?? <CompanyAvatar mine withName variant="outline" size={32} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className="w-48">
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
        {myUsers && (
          <UserSubDropdown
            users={myUsers}
            onSelectedUser={onSelectUser}
          />
        )}

        {/* Roles Submenu */}
        {myRoles && (
          <RoleSubDropdown
            roles={myRoles}
            onSelectedRole={onSelectRole}
          />
        )}

        {/* Invitations Submenu */}
        {myInvitations && (
          <InvitationSubDropdown
            invitations={myInvitations}
            onSelectedInvitation={onSelectInvitation}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
