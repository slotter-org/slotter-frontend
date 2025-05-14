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
  const { me } = useContext(MeContext);

  const { myRoles: wmsRoles = [], myPermissions: wmsPermissions = [] } = useMyWms();
  const { myRoles: companyRoles = [], myPermissions: companyPermissions = [] } = useMyCompany();

  const isWms = me?.userType === 'wms';
  const allPermissions: Permission[] = isWms ? wmsPermissions : companyPermissions;
  const entityRoles: Role[] = isWms ? wmsRoles : companyRoles;

  const [loading, setLoading] = useState(false);

  const handleSaveRolePermissions = async (roleId: string, updatedPermissions: Permission[]) => {
    try {
      setLoading(true);
      const resp = await updateRolePermissions({ role_id: roleId, permissions: updatedPermissions });
      console.log('[handleSaveRolePermissions] Updated permissions:', resp.message);
      // Optionally re-fetch roles here
    } catch (error) {
      console.error('[handleSaveRolePermissions] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setLoading(true);
      const resp = await deleteRole({ role_id: roleId });
      console.log('[handleDeleteRole] Deleted role:', resp.message);
      // Optionally re-fetch roles or remove from local state
    } catch (error) {
      console.error('[handleDeleteRole] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // We pass allPermissions so we can do a lookup by ID in the drop zone
  return (
    <div className="flex w-full h-full gap-4 mx-auto">
      <div className="w-[40%]">
        <PermissionFilterCard
          permissions={allPermissions}
          onDragPermission={(p) => {
            console.log(`[PermissionFilterCard] Dragging permission: ${p.name}`);
          }}
        />
      </div>

      <div className="w-full">
        <RoleCardFilter
          roles={entityRoles}
          onSavePermissions={handleSaveRolePermissions}
          onDeleteRole={handleDeleteRole}
          onUpdateRole={(roleId, newName, newDesc) => {
            console.log(`[RolesManagementContent] Update role: ${roleId} => ${newName}, ${newDesc}`);
            // Optionally call an API or do something else
          }}
        />
      </div>
    </div>
  );
}
