import React, { useEffect, useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { WmsAvatar, CompanyAvatar, UserAvatar } from '@/components/common/avatars/Avatar';
import { useMyWms } from '@/contexts/MyWmsProvider';
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

export interface WmsAvatarDropdownProps {
  /** Custom trigger element; falls back to default avatar */
  trigger?: React.ReactNode;
  onSelectCompany: (companyId: string) => void;
  onSelectUser: (userId: string) => void;
}

export function WmsAvatarDropdown({
  trigger,
  onSelectCompany,
  onSelectUser,
}: WmsAvatarDropdownProps) {
  const { myWms, myCompanies, myUsers } = useMyWms();

  return (
    <DropdownMenu>
      {/* Trigger button for Radix */}
      <DropdownMenuTrigger asChild>
        <button className="p-0 rounded-full focus:outline-none">
          {trigger ?? <WmsAvatar mine withName variant="outline" size={32} />}
        </button>
      </DropdownMenuTrigger>

      {/* Open at bottom-right */}
      <DropdownMenuContent side="right" align="start" className="w-48">
        <DropdownMenuLabel className="capitalize">
          {myWms?.name || 'WMS'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Companies Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between pr-2">
            <div className="flex items-center gap-2">
              <Building2 size={16} />
              <span>Companies</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {myCompanies && myCompanies.length > 0 ? (
              myCompanies.map((company) => (
                <DropdownMenuItem key={company.id} onClick={() => onSelectCompany(company.id)}>
                  <div className="flex items-center gap-2">
                    <CompanyAvatar company={company} mine={false} withName={true} variant="ghost" size={24} className="p-0" />
                    <span>{company.name}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No Companies</DropdownMenuItem>
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
                    <UserAvatar user={user} mine={false} withName={true} variant="ghost" size={24} className="p-0" />
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
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

