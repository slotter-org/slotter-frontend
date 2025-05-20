import React, { useContext, useState } from 'react';
import { MeContext } from '@/contexts/MeProvider';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import { useMyWms } from '@/contexts/MyWmsProvider';
import type { Invitation } from '@/types/invitation';
import { InvitationFilterCard } from '@/components/common/cards/filter/InvitationFilterCard';
import { resendInvitation, cancelInvitation, expireInvitation } from '@/api/InvitationService';

export function InvitationManagementContent() {
  const { me } = useContext(MeContext);
  const { myInvitations, loading, error, fetchMyInvitations } = useMyCompany();
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);

  // Handle resending an invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      console.log("Resending invitation:", invitationId);
      await resendInvitation({
        invitation_id: invitationId
      });
      console.log("Invitation resent successfully, refreshing invitations");
    } catch (error) {
      console.error("[handleResendInvitation] Error:", error);
    }
  };

  // Handle canceling an invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      console.log("Canceling invitation:", invitationId);
      await cancelInvitation({
        invitation_id: invitationId
      });
      console.log("Invitation canceled successfully, refreshing invitations");
    } catch (error) {
      console.error("[handleCancelInvitation] Error:", error);
    }
  };

  // Handle expiring an invitation
  const handleExpireInvitation = async (invitationId: string) => {
    try {
      console.log("Marking invitation as expired:", invitationId);
      await expireInvitation({
        invitation_id: invitationId
      });
      console.log("Invitation marked as expired successfully, refreshing invitations");
    } catch (error) {
      console.error("[handleExpireInvitation] Error:", error);
    }
  };

  // Handle creating a new invitation
  const handleCreateInvitation = () => {
    setIsCreatingInvitation(true);
    // You would typically show a dialog or navigate to a create invitation page
    console.log("Create invitation clicked");
    // For this example, we'll just log it
    // In a real implementation, you'd show a dialog or navigate to a form
  };

  // If loading, show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  // If error, show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-destructive">
        Error loading invitations: {error}
      </div>
    );
  }

  // If no invitations, still show the component but it will display empty state internally
  if (!myInvitations) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No invitations found.
      </div>
    );
  }

  // Log invitations for debugging
  console.log("InvitationManagementContent has invitations:", {
    count: myInvitations.length,
    sample: myInvitations.slice(0, 0),
  });

  return (
    <div className="flex w-full h-full gap-4 mx-auto overflow-hidden">
      {/* Only the invitation filter, taking up the full width */}
      <div className="flex-1 h-full overflow-hidden">
        <InvitationFilterCard
          invitations={myInvitations}
          onResendInvitation={handleResendInvitation}
          onCancelInvitation={handleCancelInvitation}
          onExpireInvitation={handleExpireInvitation}
          onCreateInvitation={handleCreateInvitation}
          isLoading={loading}
        />
      </div>
      
      {/* If you want to add a create invitation dialog, you would add it here */}
      {/* {isCreatingInvitation && (
        <InvitationCreateDialog
          open={isCreatingInvitation}
          onClose={() => setIsCreatingInvitation(false)}
          onSuccess={() => {
            setIsCreatingInvitation(false);
            fetchMyInvitations();
          }}
        />
      )} */}
    </div>
  );
}

