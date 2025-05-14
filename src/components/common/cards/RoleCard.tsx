import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash2, Save, KeyRound, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { PermissionDropZone } from '@/components/common/utils/PermissionDropZone';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  role: Role;
  onDelete?: (roleId: string) => void;
  onUpdateRole?: (roleId: string, name: string, description: string) => void;
  onSavePermissions?: (roleId: string, permissions: Permission[]) => void;
}

// Utility to deep clone safely
const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const arePermissionsEqual = (perms1: Permission[] = [], perms2: Permission[] = []) => {
  if (perms1.length !== perms2.length) return false;
  const ids1 = new Set(perms1.map((p) => p.id));
  const ids2 = new Set(perms2.map((p) => p.id));
  if (ids1.size !== ids2.size) return false;
  return [...ids1].every((id) => ids2.has(id));
};

export function RoleCard({
  role,
  onDelete,
  onUpdateRole,
  onSavePermissions
}: RoleCardProps) {
  const originalRoleRef = useRef<Role>(deepClone(role));

  const [localRole, setLocalRole] = useState<Role>(deepClone(role));
  const [selectedPermissions, setSelectedPermissions] = useState<Permission>(
    deepClone(role.permissions || [])
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [isStale, setIsStale] = useState(false);

  // For the "Update Role" dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [roleName, setRoleName] = useState(role.name);
  const [roleDescription, setRoleDescription] = useState(role.description || "");

  // Track if permissions changed
  const [permissionsChanged, setPermissionsChanged] = useState(false);

  // Sync with incoming role updates
  useEffect(() => {
    const prevSnapshot = originalRoleRef.current;
    const incoming = role;

    // Check if name/desc/avatar changed from server
    const basicPropsChanged =
      prevSnapshot.name !== incoming.name ||
      prevSnapshot.description !== incoming.description ||
      prevSnapshot.avatarURL !== incoming.avatarURL;

    // Check if permissions changed from server
    const permsChangedFromServer = !arePermissionsEqual(
      prevSnapshot.permissions || [],
      incoming.permissions || []
    );

    if (basicPropsChanged || permsChangedFromServer) {
      // Mark stale if new changes arrived from outside
      setIsStale(true);
    }

    // If not actively editing (and not in the update role dialog):
    // sync local state with the new server data
    if (!isEditing && !updateDialogOpen) {
      setLocalRole(deepClone(incoming));
      setSelectedPermissions(deepClone(incoming.permissions || []));
      setRoleName(incoming.name);
      setRoleDescription(incoming.description || "");
      if (isStale) {
        // Re-sync the 'originalRoleRef' so we don't keep marking stale
        originalRoleRef.current = deepClone(incoming);
        setIsStale(false);
      }
    }
  }, [role, isEditing, updateDialogOpen, isStale]);

  // If the user changes selectedPermissions, detect if it differs from the original
  useEffect(() => {
    const origPerms = originalRoleRef.current.permissions || [];
    const changed = !arePermissionsEqual(selectedPermissions, origPerms);
    setPermissionsChanged(changed);
  }, [selectedPermissions]);

  // Handle drag-drop
  const handlePermissionDrop = (permission: Permission) => {
    // If not present, add
    if (!selectedPermissions.some((p) => p.id === permission.id)) {
      const newPermissions = [...selectedPermissions, deepClone(permission)];
      setSelectedPermissions(newPermissions);
      // Keep localRole in sync:
      setLocalRole((prev) => ({
        ...prev,
        permissions: newPermissions
      }));
    }
  };

  const handlePermissionRemove = (permission: Permission) => {
    const newPermissions = selectedPermissions.filter((p) => p.id !== permission.id);
    setSelectedPermissions(newPermissions);
    // Keep localRole in sync:
    setLocalRole((prev) => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  // Toggling the "Edit Permissions" mode
  const handleToggleEditMode = () => {
    if (isStale) return; // if stale, force refresh first
    if (isEditing && permissionsChanged) {
      // If we are turning OFF editing and something changed => save
      if (onSavePermissions) {
        onSavePermissions(localRole.id, selectedPermissions);
      }
      // Update the original reference
      originalRoleRef.current = deepClone(localRole);
      originalRoleRef.current.permissions = deepClone(selectedPermissions);
      setPermissionsChanged(false);
    }
    setIsEditing(!isEditing);
  };

  const handleOpenUpdateDialog = () => {
    if (isStale) return;
    setRoleName(localRole.name);
    setRoleDescription(localRole.description || "");
    setUpdateDialogOpen(true);
  };

  const handleDelete = () => {
    if (isStale) return;
    onDelete?.(localRole.id);
  };

  // Refresh local state with server data
  const handleRefresh = () => {
    const freshRole = deepClone(role);
    setLocalRole(freshRole);
    setSelectedPermissions(deepClone(freshRole.permissions || []));
    setRoleName(freshRole.name);
    setRoleDescription(freshRole.description || "");
    originalRoleRef.current = deepClone(freshRole);
    setIsStale(false);
    setIsEditing(false);
    setUpdateDialogOpen(false);
  };

  // Actually apply name/desc update
  const handleUpdateRole = () => {
    if (!onUpdateRole || isStale || !roleName.trim()) {
      setUpdateDialogOpen(false);
      return;
    }

    const nameChanged = roleName !== originalRoleRef.current.name;
    const descChanged = roleDescription !== (originalRoleRef.current.description || "");

    if (nameChanged || descChanged) {
      onUpdateRole(localRole.id, roleName.trim(), roleDescription.trim());
    }
    setUpdateDialogOpen(false);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <>
      <Card className={cn("w-full", isStale && "border-amber-400")}>
        {isStale && (
          <Alert
            variant="warning"
            className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-b-none"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="flex w-full items-center justify-between">
              <AlertDescription className="text-amber-600 dark:text-amber-300">
                {isEditing
                  ? "This role has been updated elsewhere. Please refresh before continuing."
                  : "This role has been updated elsewhere. Refresh to see the latest data."}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-4 border-amber-500 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </Alert>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {localRole.avatarURL ? (
                  <AvatarImage
                    src={localRole.avatarURL || "/placeholder.svg"}
                    alt={localRole.name}
                  />
                ) : (
                  <AvatarFallback>{getInitials(localRole.name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{localRole.name}</h3>
                {localRole.description && (
                  <p className="text-sm text-muted-foreground">
                    {localRole.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle Permissions Edit mode */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleEditMode}
                      className={cn(
                        "flex items-center gap-1",
                        isStale && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isStale}
                      aria-label={isEditing ? "Save Permissions" : "Edit Permissions"}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          <span className="hidden sm:inline">Save</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit Permissions</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isEditing
                      ? isStale
                        ? "Refresh required before saving"
                        : "Save permission changes"
                      : isStale
                        ? "Refresh required before editing"
                        : "Edit role permissions"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Update name/desc */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenUpdateDialog}
                      className={cn(
                        "flex items-center gap-1",
                        isStale && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isStale}
                      aria-label="Update role"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden sm:inline">Update</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isStale ? "Refresh required before updating" : "Update role details"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Delete role */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className={cn(
                        "flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground",
                        isStale && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isStale}
                      aria-label="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isStale ? "Refresh required before deleting" : "Delete this role"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <PermissionDropZone
            title={isEditing ? "Editing Role Permissions..." : "Role Permissions"}
            selectedPermissions={selectedPermissions}
            onPermissionDrop={isEditing && !isStale ? handlePermissionDrop : undefined}
            onPermissionRemove={isEditing && !isStale ? handlePermissionRemove : undefined}
            isEditing={isEditing}
          />

          {/* If stale while editing, show a warning */}
          {isEditing && isStale && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-md text-amber-700 dark:text-amber-300 text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>
                  This role has been updated elsewhere. Please refresh before making further changes.
                </p>
              </div>
            </div>
          )}

          {/* If user has unsaved permission changes */}
          {isEditing && permissionsChanged && !isStale && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 rounded-md text-blue-700 dark:text-blue-300 text-sm">
              <p>You've made changes to the permissions. Click "Save" to apply them.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Role Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Role</DialogTitle>
            <DialogDescription>
              Make changes to the role name and description
            </DialogDescription>
          </DialogHeader>

          {isStale && (
            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This role has been updated elsewhere. Please refresh before making changes.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="col-span-3"
                disabled={isStale}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="col-span-3"
                disabled={isStale}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isStale || !roleName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
