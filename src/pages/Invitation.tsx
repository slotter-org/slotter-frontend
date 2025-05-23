import { InvitationManagementContent } from '@/components/common/dialogs/content/InvitationManagementContent'
import { InvitationCreateDialog } from '@/components/common/dialogs/InvitationCreateDialog'
import { Button } from '@/components/ui/button'
import { Mail, Plus } from 'lucide-react'
import { useMyCompany } from '@/contexts/MyCompanyProvider'

export function InvitationPage() {
  const { fetchMyInvitations } = useMyCompany()
  
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 w-full shrink-0">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          Invitation Management
        </h1>
        <div className="ml-auto">
          <InvitationCreateDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            }
            onSuccess={() => {

            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <InvitationManagementContent />
      </div>
    </div>
  ) 
}
