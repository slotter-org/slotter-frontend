import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SecondaryDialog } from '@/components/common/dialogs/SecondaryDialog';
import { createRole, updateRoleNameDesc } from '@/api/RoleService';

// Basic error feedback
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-sm text-red-500 mt-2">
      {message}
    </div>
  );
}

interface RoleCreateDialogProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function RoleCreateDialog({ trigger, onSuccess }: RoleCreateDialogProps) {
  const [error, setError] = useState('');

  return (
    <SecondaryDialog
      trigger={trigger}
      title="Create Role"
      description="Enter the details to create a new role."
      inputs={[
        { id: 'name', label: 'Name', placeholder: 'Admin, Manager...', required: true },
        { id: 'description', label: 'Description', placeholder: 'What does this role do?' },
      ]}
      buttonText="Create"
      onSubmit={async (values, closeDialog) => {
        setError('');
        try {
          await createRole({
            name: values.name.trim(),
            description: values.description.trim(),
          });
          onSuccess?.();
          closeDialog(); // close on success
        } catch (e: any) {
          console.error('[RoleCreateDialog] Error:', e);
          setError(e?.message || 'Failed to create role.');
        }
      }}
    >
      {error && <ErrorMessage message={error} />}
    </SecondaryDialog>
  );
}

interface RoleUpdateDialogProps {
  trigger: React.ReactNode;
  roleId: string;
  currentName: string;
  currentDescription?: string;
  onSuccess?: () => void; // callback to re-fetch
}

export function RoleUpdateDialog({
  trigger,
  roleId,
  currentName,
  currentDescription = '',
  onSuccess,
}: RoleUpdateDialogProps) {
  const [error, setError] = useState('');

  return (
    <SecondaryDialog
      trigger={trigger}
      title="Update Role"
      description="Modify the details of this role."
      inputs={[
        {
          id: 'name',
          label: 'Name',
          placeholder: 'Admin, Manager...',
          defaultValue: currentName,
          required: true,
        },
        {
          id: 'description',
          label: 'Description',
          placeholder: 'What does this role do?',
          defaultValue: currentDescription,
        },
      ]}
      buttonText="Update"
      onSubmit={async (values, closeDialog) => {
        setError('');
        try {
          await updateRoleNameDesc({
            role_id: roleId,
            name: values.name.trim(),
            description: values.description.trim(),
          });
          onSuccess?.();
          closeDialog();
        } catch (e: any) {
          console.error('[RoleUpdateDialog] Error:', e);
          setError(e?.message || 'Failed to update role.');
        }
      }}
    >
      {error && <ErrorMessage message={error} />}
    </SecondaryDialog>
  );
}
