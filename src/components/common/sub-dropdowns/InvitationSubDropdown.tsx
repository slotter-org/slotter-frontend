import React from 'react';
import { Ticket } from 'lucide-react';
import { InvitationAvatar } from '@/components/common/avatars/Avatar';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface InvitationSubDropdownProps {
  invitations: Invitation[];
  onSelectInvitation: (invitationId: string) => void;
}

function getInvitationName(inv: Invitation): string {
  if (inv.email) {
    return inv.email;
  }
  if (inv.phoneNumber) {
    return inv.phoneNumber;
  }
  return '—';
}

export function InvitationSubDropdown({
  invitations,
  onSelectInvitation,
}: InvitationSubDropdownProps) {
  const toShow = roles.slice(0, 5);
  const isScrollable = roles.length > 5;

  

  return (
    <DropdownMenuSub>
      {/* Trigger */}
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1">
        <Ticket size={16} />
        <span>Invitations</span>
      </DropdownMenuSubTrigger>

      {/* Content */}
      <DropdownMenuSubContent className="p-0 w-48">
        <div className={isScrollable ? 'max-h-48 overflow-y-auto' : ''}>
          {toShow.map((invitation) => (
            <DropdownMenuItem
              key={invitation.id}
              onClick={() => onSelectInvitation(invitation.id)}
              className="px-2 py-1"
            >
              <div className="flex items-center gap-2 capitalize">
                <InvitationAvatar
                  invitation={invitation}
                  variant="ghost"
                  size={16}
                  className="p-0"
                  withName={false}
                />
                <span>{getInvitationName(inv)}</span>
              </div>
            </DropdownMenuItem>
          ))}
          
          {invitations.length === 0 && (
            <DropdownMenuItem disabled className="px-2 py-1">
              No Invitations
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
