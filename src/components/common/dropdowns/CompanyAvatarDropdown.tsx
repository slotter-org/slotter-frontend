import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { CompanyAvatar, UserAvatar } from '@/components/common/avatars/Avatar';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
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
  trigger?: React.ReactNode;
  onAddWarehouse: () => void;
  onSelectWarehouse: (warehouseId: string) => void;
  onSelectUser: (userId: string) => void;
}

export function CompanyAvatarDropdown({
  trigger,
  onAddWarehouse,
  onSelectWarehouse,
  onSelectUser,
}: CompanyAvatarDropdownProps) {
  const { myCompany, myWarehouses, myUsers } = useMyCompany();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? <CompanyAvatar mine withName variant="outline" size={32} />}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end" className="w-48">
        <DropdownMenuLabel>{myCompany?.name || 'Company'}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Warehouse Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between pr-2">
            <span>Warehouses</span>
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
                  {wh.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Warehouses</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Users Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Users</DropdownMenuSubTrigger>
          <DropdownMenySubContent>
            {myUsers && myUsers.length > 0 ? (
              myUsers.map((user) => (
                <DropdownMenuItem key={user.id} onClick={() => onSelectUser(user.id)}>
                  <UserAvatar
                    user={user}
                    mine={false}
                    withName={true}
                    variant="ghost"
                    size={24}
                    className="p-0"
                  />
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Users</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
