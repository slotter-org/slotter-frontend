import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/common/dialogs/CustomDialog';
import { createRole, updateRoleNameDesc } from '@/api/RoleService';

interface RoleCreateDialogProps {
  trigger: React.ReactNode;
}

export function RoleCreateDialog({ trigger }: RoleCreateDialogProps) {
  return (
    <CustomDialog
      trigger={trigger}
      title="Create Role"
      description="Enter the details to create a new role."
      inputs={[
        { id: 'name', label: 'Name', placeholder: 'Admin, Manager...', required: true },
        { id: 'description', label: 'Description', placeholder: 'What does this role do?' },
      ]}
      buttonText="Create"
      onSubmit={async (values) => {
        await createRole({ name: values.name.trim(), description: values.description.trim() });
      }}
    />
  );
}

interface RoleUpdateDialogProps {
  trigger: React.ReactNode;
  roleId: string;
  currentName: string;
  currentDescription?: string;
}

export function RoleUpdateDialog({
  trigger,
  roleId,
  currentName,
  currentDescription = '',
}: RoleUpdateDialogProps) {
  return (
    <CustomDialog
      trigger={trigger}
      title="Update Role"
      description="Modify the details of this role."
      inputs={[
        { id: 'name', label: 'Name', placeholder: 'Admin, Manager...', defaultValue: currentName, required: true },
        { id: 'description', label: 'Description', placeholder: 'What does this role do?', defaultValue: currentDescription },
      ]}
      buttonText="Update"
      onSubmit={async (values) => {
        await updateRoleNameDesc({ role_id: roleId, name: values.name.trim(), description: values.description.trim() });
      }}
    />
  );
}
