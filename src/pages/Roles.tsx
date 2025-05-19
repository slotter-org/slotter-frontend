import { RolesManagementContent } from '@/components/common/dialogs/content/RolesManagementContent'
import { RoleCreateDialog } from '@/components/common/dialogs/RoleCreateDialog'
import { Button } from '@/components/ui/button'
import { useMyCompany } from '@/contexts/MyCompanyProvider'

export function RolesPage() {
  const { fetchMyRoles } = useMyCompany()
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 w-full shrink-0">
        <h1 className="text-3xl font-bold">Role & Permission Management</h1>
        <div className="ml-auto">
          <RoleCreateDialog
            trigger={
              <Button variant="outline" size="sm">
                Create
              </Button>
            }
            onSuccess={() => {

            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <RolesManagementContent />
      </div>
    </div>
  ) 
}
