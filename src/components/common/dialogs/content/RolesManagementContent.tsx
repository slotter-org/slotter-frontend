import React, { useContext, useState } from 'react';
import { MeContext } from '@/contexts/MeProvider';
import { useMyWms } from '@/contexts/MyWmsProvider';
import { useMyCompany } from '@/contexts/MyCompanyProvider';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { PermissionFilterCard } from '@/components/common/cards/filter/PermissionFilterCard';
import { RoleCardFilter } from '@/components/common/cards/filter/RoleCardFilter';
import { updateRolePermissions, deleteRole } from '@/api/RoleService';

// Optionally, if your contexts allow refreshing, call them in these methods after success
export function RolesManagementContent() {
  const { me } = useContext(MeContext);

  const { myRoles: wmsRoles = [], myPermissions: wmsPermissions = [] } = useMyWms();
  const { myRoles: companyRoles = [], myPermissions: companyPermissions = [] } = useMyCompany();

  const isWms = me?.userType === 'wms';
  const allPermissions: Permission[] = isWms ? wmsPermissions : companyPermissions;
  const entityRoles: Role[] = isWms ? wmsRoles : companyRoles;

  const [loading, setLoading] = useState(false);

  // Save permissions for a role
  const handleSaveRolePermissions = async (roleId: string, updatedPermissions: Permission[]) => {
    try {
      setLoading(true);
      const resp = await updateRolePermissions({ role_id: roleId, permissions: updatedPermissions });
      console.log('[handleSaveRolePermissions] Updated permissions:', resp.message);
      // e.g. trigger a context-based refresh or local state update
    } catch (error) {
      console.error('[handleSaveRolePermissions] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a role
  const handleDeleteRole = async (roleId: string) => {
    try {
      setLoading(true);
      const resp = await deleteRole({ role_id: roleId });
      console.log('[handleDeleteRole] Deleted role:', resp.message);
      // e.g. refresh or remove from local state
    } catch (error) {
      console.error('[handleDeleteRole] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full gap-4 mx-auto">
      {/* Left side: Permission filter & drag source */}
      <div className="w-[40%]">
        <PermissionFilterCard
          permissions={allPermissions}
          onDragPermission={(p) => {
            console.log(`[PermissionFilterCard] Dragging permission: ${p.name}`);
          }}
        />
      </div>

      {/* Right side: Roles list / management (drop targets) */}
      <div className="w-full">
        <RoleCardFilter
          roles={entityRoles}
          onSavePermissions={handleSaveRolePermissions}
          onDeleteRole={handleDeleteRole}
          // If you want to rename or update role name/desc:
          onUpdateRole={(roleId, newName, newDesc) => {
            // Optionally handle role name/desc update here or in an API call
            console.log(
              `[RolesManagementContent] Updating role ${roleId} => ${newName}, ${newDesc}`
            );
          }}
        />
      </div>
    </div>
  );
}
