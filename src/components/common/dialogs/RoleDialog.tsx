import type React from "react"

import { Button } from "@/components/ui/button"
import { TabbedDialog } from "@/components/common/dialogs/TabbedDialog"
import { RoleCreateDialog } from "@/components/common/dialogs/RoleCreateDialog"
import { RolesManagementContent } from "@/components/common/dialogs/content/RolesManagementContent"
import { useMyCompany } from "@/contexts/MyCompanyProvider"

export function RoleDialog({ trigger }: { trigger: React.ReactNode }) {
  const { fetchMyRoles } = useMyCompany()

  return (
    <TabbedDialog
      trigger={trigger}
      title="Role & Permission Management"
      tabTitle="Role Management"
      helpContent={
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This area lets you manage all your roles and permissions.</p>
          <ul className="list-disc pl-6">
            <li>Drag & drop permissions to assign them to roles.</li>
            <li>Create new roles in the "Create a Role" form (see below).</li>
            <li>Update or delete existing roles in the role list.</li>
          </ul>
        </div>
      }
      topRightSlot={
        <RoleCreateDialog
          trigger={
            <Button variant="outline" size="sm">
              Create
            </Button>
          }
          onSuccess={() => {
            // Refresh roles after creating a new one
            fetchMyRoles()
          }}
        />
      }
      bottomRightButtonText="Close"
    >
      <RolesManagementContent />
    </TabbedDialog>
  )
}

