import React, { useContext } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { UserAvatar } from '@/components/common/avatars/Avatar';
import { MeContext } from '@/contexts/MeProvider';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface UserAvatarDropdownProps {
  trigger?: React.ReactNode;
  onSettings: () => void;
  onLogout: () => void;
}

export function UserAvatarDropdown({
  trigger,
  onSettings,
  onLogout,
}: UserAvatarDropdownProps) {
  const { me } = useContext(MeContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-0 rounded-full focus:outline-none">
          {trigger ?? <UserAvatar mine withName variant="outline" size={32} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left" align="start" className="w-48">
        <DropdownMenuLabel className="capitalize">
          {me?.name || 'Profile'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem onClick={onSettings} className="flex items-center gap-2">
          <Settings size={16} />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* ThemeToggle */}
        <DropdownMenuItem className="flex items-center gap-2">
          <ThemeToggle />
          <span>Theme</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Logout in footer */}
        <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2">
          <LogOut size={16} />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
