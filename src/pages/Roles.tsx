import { RolesManagementContent } from '@/components/common/dialogs/content/RolesManagementContent'
import { RoleCreateDialog } from '@/components/common/dialogs/RoleCreateDialog'
import { Button } from '@/components/ui/button'
import { useMyCompany } from '@/contexts/MyCompanyProvider'

export function RolesPage() {
  const { fetchMyRoles } = useMyCompany()
  return (
    <div className="flex flex-col flex-1 h-full p-4">
      <div className="flex justify-between items-center mb-4 w-full">
        <h1 className="text-3xl font-bold">Role & Permission Management</h1>
        <div className="ml-auto">
          <RoleCreateDialog
            trigger={
              <Button variant="outline" size="sm">
                Create
              </Button>
            }
            onSuccess={() => {
              fetchMyRoles()
            }}
          />
        </div>
      </div>
      <RolesManagementContent />
    </div>
  ) 
}
