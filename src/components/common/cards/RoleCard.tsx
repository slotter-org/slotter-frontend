import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Pencil, Trash2, Save, KeyRound, RefreshCw, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Role } from '@/types/role'
import type { Permission } from '@/types/permission'
import { PermissionDropZone } from '@/components/common/utils/PermissionDropZone'

interface RoleCardProps {
  role: Role
  onDelete?: (roleId: string) => void
  onUpdate?: (roleId: string, name: string, description: string) => void
  onSavePermissions?: (roleId: string, permissions: Permission[]) => void
}

const deepClone = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

const arePermissionsEqual = (perms1: Permission[] = [], perms2: Permission[] = []): boolean => {
  if (perms1.length !== perms2.length) return false
  const ids1 = new Set(perms1.map((p) => p.id))
  const ids2 = new Set(perms2.map((p) => p.id))
  if (ids1.size !== ids2.size) return false
  return [...ids1].every((id) => ids2.has(id))
}

export function RoleCard({ role, onDelete, onUpdate, onSavePermissions }: RoleCardProps) {
  const originalRoleRef = useRef<Role>(deepClone(role))
  const [localRole, setLocalRole] = useState<Role>(deepClone(role))
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(deepClone(role.permissions || []))
  const [isEditing, setIsEditing] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [roleName, setRoleName] = useState(role.name)
  const [roleDescription, setRoleDescription] = useState(role.description)
  const [permissionsChanged, setPermissionsChanged] = useState(false)

  useEffect(() => {
    const currentSnapshot = originalRoleRef.current
    const incomingRole = role
    const basicPropsChanged =
      currentSnapshot.name !== incomingRole.name ||
      currentSnapshot.description !== incomingRole.description ||
      currentSnapshot.avatarURL !== incomingRole.avatarURL
    const permissionsChangedFromServer = !arePermissionsEqual(currentSnapshot.permissions || [], incomingRole.permissions || [])
    if (basicPropsChanged || permissionsChangedFromServer) {
      setIsStale(true)
    }
    if (!isEditing && !updateDialogOpen) {
      setLocalRole(deepClone(role))
      setSelectedPermissions(deepClone(role.permissions || []))
      setRoleName(role.name)
      setRoleDescription(role.description || "")
      if (isStale) {
        originalRoleRef.current = deepClone(role)
        setIsStale(false)
      }
    }
  }, [role, isEditing, updateDialogOpen])

  useEffect(() => {
    const originalPermissions = originalRoleRef.current.permissions || []
    const changed = !arePermissionsEqual(selectedPermissions, originalPermissions)
    setPermissionsChanged(changed)
  }, [selectedPermissions])

  const handlePermissionDrop = (permission: Permission) => {
    if (!selectedPermissions.some((p) => p.id === permission.id)) {
      setSelectedPermissions([...selectedPermissions, deepClone(permission)])
    }
  }
  const handlePermissionRemove = (permission: Permission) => {
    setSelectedPermissions(selectedPermissions.filter((p) => p.id !== permission.id))
  }
  const handleToggleEditMode = () => {
    if (isStale) {
      return
    }
    if (isEditing && permissionsChanged) {
      if (onSavePermissions) {
        onSavePermissions(localSnapshot.id, selectedPermissions)
      }
      originalRoleRef.current = deepClone(localRole)
      originalRoleRef.current.permissions = deepClone(selectedPermissions)
      setPermissionsChanged(false)
    }
    setIsEditing(!isEditing)
  }

  const handleOpenUpdateDialog = () => {
    if (isStale) {
      return
    }
    setRoleName(localRole.name)
    setRoleDescription(localRole.description || "")
    setUpdateDialogOpen(true)
  }
  
  const handleUpdateRole = () => {
    const nameChanged = roleName !== originalRoleRef.current.name
    const descriptionChanged = roleDescription !== (originalRoleRef.current.description || "")
    if (nameChanged || descriptionChanged) {
      if (onUpdate) {
        onUpdate(localRole.id, roleName, roleDescription)
      }
    }
    setUpdateDialogOpen(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(localRole.id)
    }
  }

  const handleRefresh = () => {
    setLocalRole(deepClone(role))
    setSelectedPermissions(deepClone(role.permissions || []))
    setRoleName(role.name)
    setRoleDescription(role.description || "")
    originalRoleRef.current = deepClone(role)
    setIsStale(false)
    setIsEditing(false)
    setUpdateDialogOpen(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <Card className={`w-full ${isStale ? "border-amber-400" : ""}`}>
        {isStale && (
          <Alert variant="warning" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-b-none">
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
                  <AvatarImage src={localRole.avatarURL || "/placeholder.svg"} alt={localRole.name} />
                ) : (
                  <AvatarFallback>{getInitials(localRole.name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{localRole.name}</h3>
                {localRole.description && <p className="text-sm text-muted-foreground">{localRole.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleEditMode}
                      className={`flex items-center gap-1 ${isStale ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isStale}
                      aria-label={isEditing ? "Save Permissions": "Edit Permissions"}
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenUpdateDialog}
                      className={`flex items-center gap-1 ${isStale ? "opacity-50 cursor-not-allowed" : ""}`}
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className={`flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground ${isStale ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isStale}
                      aria-label="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isStale ? "Refresh required before deleting" : "Delete this role"}</TooltipContent>
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
          
          {isEditing && isStale && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-md text-amber-700 dark:text-amber-300 text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>
                  This role has been updated elsewhere. Please refresh to see the latest data before making changes.
                </p>
              </div>
            </div>
          )}

          {isEditing && permissionsChanged && !isStale && (
            <div className="mt-4 p-3 bg-blue-500 dark:bg-blue-950/30 border border-blue-300 rounded-md text-blue-700 dark:text-blue-300 text-sm">
              <p>You've made changes to the permissions. Click "Save" to apply these changes.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Role Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Role</DialogTitle>
            <DialogDescription>Make changes to the role name and description</DialogDescription>
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
  )
}
