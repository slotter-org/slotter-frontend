import React, { useContext, useState } from 'react';
import { MeContext } from '@/contexts/MeProvider';
import { useMyWms } from '@/contexts/MyWmsProvider';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { PermissionFilterCard } from '@/components/common/cards/filter/PermissionFilterCard';
import { RoleCardFilter } from '@/components/common/cards/filter/RoleCardFilter';
import { updateRolePermissions, deleteRole } from '@/api/RoleService';

export function RolesManagementContent() {
  const { me } = useContext(MeContext)
  const { myRoles, myPermissions, loading, error, fetchMyRoles, fetchMyPermissions } = useMyCompany()

  // Update the handleSaveRolePermissions function to properly handle permission updates
  const handleSaveRolePermissions = async (roleId: string, updatedPermissions: Permission[]) => {
    try {
      console.log("Saving role permissions:", {
        roleId,
        permissionsCount: updatedPermissions.length,
        permissions: updatedPermissions,
      })

      await updateRolePermissions({
        role_id: roleId,
        permissions: updatedPermissions,
      })

      // Refresh roles after update
      console.log("Permissions updated successfully, refreshing roles")
      fetchMyRoles()
    } catch (error) {
      console.error("[handleSaveRolePermissions] Error:", error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole({ role_id: roleId })

      // Refresh roles after deletion
      fetchMyRoles()
    } catch (error) {
      console.error("[handleDeleteRole] Error:", error)
    }
  }

  const handleUpdateRole = (roleId: string, newName: string, newDesc: string) => {
    // The actual API call is handled in the RoleCard component
    // We just need to refresh the roles after update
    fetchMyRoles()
  }

  // If loading or no data, show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  // If error, show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-destructive">
        Error loading roles and permissions: {error}
      </div>
    )
  }

  // If no roles or permissions, show empty state
  if (!myRoles || !myPermissions) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No roles or permissions found.
      </div>
    )
  }

  // Log the permissions to verify they exist
  console.log("RolesManagementContent has permissions:", {
    count: myPermissions.length,
    sample: myPermissions.slice(0, 3),
  })

  return (
    <div className="flex w-full min-h-screen gap-4 mx-auto">
      <div className="w-[40%]">
        <PermissionFilterCard
          permissions={myPermissions}
          onDragPermission={(p) => {
            console.log(`[PermissionFilterCard] Dragging permission: ${p.name}`)
          }}
        />
      </div>

      <div className="w-full min-h-screen">
        <RoleCardFilter
          roles={myRoles}
          onSavePermissions={handleSaveRolePermissions}
          onDeleteRole={handleDeleteRole}
          onUpdateRole={handleUpdateRole}
          // Pass all permissions to RoleCardFilter
          allPermissions={myPermissions}
        />
      </div>
    </div>
  )
}

