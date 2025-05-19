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
      fetchMyInvitations();
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
      fetchMyInvitations();
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
      fetchMyInvitations();
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
    sample: myInvitations.slice(0, 3),
  });

  return (
    <div className="w-full h-full mx-auto overflow-hidden p-4">
      {/* Only the invitation filter, taking up the full width */}
      <div className="h-full w-full overflow-hidden">
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
This component:

Gets invitations from your company context
Provides handlers for resending, canceling, and expiring invitations
Provides a handler for creating new invitations (you would expand this to show a dialog)
Displays only the InvitationFilterCard, taking up the full width of the container
Shows appropriate loading, error, and empty states
Includes commented code for a potential invitation creation dialog

You can use this component in a page similar to how you're using RolesManagementContent:
jsximport { InvitationManagementContent } from '@/components/common/content/InvitationManagementContent';
import { Button } from '@/components/ui/button';
import { useMyCompany } from '@/contexts/MyCompanyProvider';

export function InvitationsPage() {
  const { fetchMyInvitations } = useMyCompany();
  
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 w-full shrink-0">
        <h1 className="text-3xl font-bold">Invitation Management</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <InvitationManagementContent />
      </div>
    </div>
  );
}
