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

  const handleSaveRole = async (roleId: string, updatedPermissions: typeof allPermissions) => {
    try {
      setLoading(true);
      const resp = await updateRolePermissions({ role_id: roleId, permissions: updatedPermissions });
      console.log('[handleSaveRole] Updated permissions:', resp.message);
    } catch (error) {
      console.error('[handleSaveRole] Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setLoading(true);
      const resp = await deleteRole({ role_id: roleId });
      console.log('[handleDeleteRole] Deleted role:', resp.message);
    } catch (error) {
      console.error('[handleDeleteRole] Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full gap-4 mx-auto">
      {/* Left Side: a "permissionfiltercard" with drag functionality */}
      <div className="w-[40%]">
        <PermissionFilterCard
          permissions={allPermissions}
          onDragPermission={(p) => {
            console.log(`Dragging permission: ${p.name}`);
          }}
        />
      </div>
      {/* Right Side: roles list / management */}
      <div className="flex-1">
        <RoleCardFilter
          roles={entityRoles}
          onSaveRole={handleSaveRole}
          onDeleteRole={handleDeleteRole}
        />
      </div>
    </div>
  );
}
