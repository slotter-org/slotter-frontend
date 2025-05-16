import React, { useContext, useState } from 'react';
import { MeContext } from '@/contexts/MeProvider';
import { useMyWms } from '@/contexts/MyWmsProvider';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import type { User } from '@/types/user';
import { PermissionFilterCard } from '@/components/common/cards/filter/PermissionFilterCard';
import { UserFilterCard } from '@/components/common/cards/filter/UserFilterCard'
import { RoleCardFilter } from '@/components/common/cards/filter/RoleCardFilter';
import { updateRolePermissions, deleteRole, updateRoleUsers } from '@/api/RoleService';

export function RolesManagementContent() {
  const { me } = useContext(MeContext)
  const { myRoles, myPermissions, myUsers, loading, error, fetchMyRoles, fetchMyPermissions, fetchMyUsers } = useMyCompany()
  
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
  
  const handleSaveRoleUsers = async (roleId: string, updatedUsers: User[]) => {
    try {
      console.log("Saving role users:", {
        roleId,
        usersCount: updatedUsers.length,
        users: updatedUsers,
      })
      
      await updateRoleUsers({
        role_id: roleId,
        users: updatedUsers,
      })
      console.log("Users updated successfully, refreshing roles")
      fetchMyRoles()
    } catch (error) {
      console.error("[handleSaveRoleUsers] Error:", error)
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
  if (!myRoles || !myPermissions || !myUsers) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No roles, permissions, or users found.
      </div>
    )
  }
  
  // Log the permissions and users to verify they exist
  console.log("RolesManagementContent has permissions:", {
    count: myPermissions.length,
    sample: myPermissions.slice(0, 3),
  })
  
  console.log("RolesManagementContent has users:", {
    count: myUsers?.length || 0,
    sample: myUsers?.slice(0, 1) || [],
  })
  
  return (
    <div className="flex w-full h-full gap-4 mx-auto overflow-hidden">
      {/* Left column - 40% width */}
      <div className="w-[40%] h-full flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <PermissionFilterCard
            permissions={myPermissions}
            onDragPermission={(p) => {
              console.log(`[PermissionFilterCard] Dragging permission: ${p.name}`)
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <UserFilterCard
            users={myUsers || []}
            roles={myRoles}
            onDragUser={(u) => {
              console.log(`[UserFilterCard] Dragging user: ${u.firstName} ${u.lastName}`)
            }}
          />
        </div>
      </div>
      
      {/* Right column - 60% width */}
      <div className="flex-1 h-full overflow-hidden">
        <RoleCardFilter
          roles={myRoles}
          onSavePermissions={handleSaveRolePermissions}
          onSaveUsers={handleSaveRoleUsers}
          onDeleteRole={handleDeleteRole}
          onUpdateRole={handleUpdateRole}
          allPermissions={myPermissions}
          allUsers={myUsers || []}
        />
      </div>
    </div>
  )
}
