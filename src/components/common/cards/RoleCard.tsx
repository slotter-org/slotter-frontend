import React, { useState, useEffect } from 'react';
import { PermissionDropZone } from '@/components/common/utils/PermissionDropZone';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash2, Save, KeyRound, RotateCcw } from 'lucide-react';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { RoleUpdateDialog } from '@/components/common/dialogs/RoleManagementSubDialogs';

interface RoleCardProps {
  role: Role
  onSave?: (roleId: string, permissions: Permission[]) => void
  onDelete?: (roleId: string) => void
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function clone<T>(obj: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj))
}

export function RoleCard({ role, onSave, onDelete }: RoleCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [snapshot, setSnapshot] = useState<Role | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([])
  const [isStale, setIsStale] = useState(false)

  /*---- initialize draft on edit start --------------*/

  useEffect(() => {
    if (isEditing) {
      if (!snapshot) {
        const snap = clone(role)
        setSnapshot(snap)
        setDraftPermissions(snap.permissions ?? [])
      }
    } else {
      setSnapshot(null)
      setDraftPermissions([])
      setIsStale(false)
    }
  }, [isEditing, role, snapshot])

  /*---- stale detection ----------------------------*/

  useEffect(() => {
    if (isEditing && snapshot && !deepEqual(role, snapshot)) {
      setIsStale(true)
    }
  }, [role, isEditing, snapshot])

  /*---- permission helpers -------------------------*/

  const handlePermissionDrop = (permission: Permission) => {
    setDraftPermissions((prev) =>
      prev.some((p) => p.id === permission.id) ? prev : [...prev, permission],
    );
  }

  const handlePermissionRemove = (permission: Permission) => {
    setDraftPermissions((prev) => prev.filter((p) => p.id !== permission.id));
  }

  /*---- save / update / delete --------------------*/

  const handleSave = () => {
    if (
      snapshot &&
      onSave &&
      !deepEqual(draftPermissions, snapshot.permissions ?? [])
    ) {
      onSave(role.id, draftPermissions)
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete?.(role.id)
  }

  const toggleEditMode = () =>
    isEditing ? handleSave() : setIsEditing(true)

  const handleResetPermissions = () => {
    if (isStale) {
      const newSnapshot = clone(role)
      setSnapshot(newSnapshot)
      setDraftPermissions(newSnapshot.permissions ?? [])
      setIsStale(false)
    } else if (snapshot) {
      setDraftPermissions(snapshot.permissions ?? [])
    }
  }
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  const displayedAvatarURL = isEditing ? snapshot.avatarURL : role.avatarURL
  const displayedRoleName = isEditing ? snapshot.name : role.name
  const displayedPermissions = isEditing ? draftPermissions : role.permissions ?? []
  let dropZoneTitle = "Role Permissions"
  if (isEditing && !isStale) {
    dropZoneTitle = "Editing Permissions..."
  } else if (isEditing && isStale) {
    dropZoneTitle = "Data is stale - please refresh"
  }
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              {displayedAvatarURL ? (
                <AvatarImage
                  src={displayedAvatarURL || '/placeholder.svg'}
                  alt={displayedRoleName}
                />
              ) : (
                <AvatarFallback>{getInitials(displayedRoleName)}</AvatarFallback>
              )}
            </Avatar>
            <h3 className="text-lg font-semibold">{displayedRoleName}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Reset Button Only Appears When Editing */}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPermissions}
                className="flex items-center gap-1"
                aria-label="Reset Permissions"
              >
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditMode}
              className="flex items-center gap-1"
              aria-label={isEditing ? 'Save Permissions' : 'Edit Permissions'}
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
            <RoleUpdateDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  aria-label="Update Role"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidde sm:inline">Update</span>
                </Button>
              }
              roleId={role.id}
              currentName={role.name}
              currentDescription={role.description ?? ''}
            />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Delete Role"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PermissionDropZone
          title={dropZoneTitle}
          selectedPermissions={displayedPermissions}
          onPermissionDrop={isEditing ? handlePermissionDrop : undefined}
          onPermissionRemove={isEditing ? handlePermissionRemove : undefined}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  )
}
