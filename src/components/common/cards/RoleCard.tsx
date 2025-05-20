import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Pencil, 
  Trash2, 
  Save, 
  KeyRound, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  ChevronDown, 
  ChevronUp,
  MoreVertical,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import type { User } from '@/types/user';
import { PermissionDropZone } from '@/components/common/utils/PermissionDropZone';
import { UserDropZone } from '@/components/common/utils/UserDropZone';
import { cn } from '@/lib/utils';
import { updateRoleNameDesc, update } from '@/api/RoleService';

interface RoleCardProps {
  role: Role
  onDelete?: (roleId: string) => void
  onUpdateRole?: (roleId: string, name: string, description: string) => void
  onSavePermissions?: (roleId: string, permissions: Permission[]) => void
  onSaveUsers?: (roleId: string, users: User[]) => void
  allPermissions?: Permission[]
  allUsers?: User[]
  compact?: boolean
}

// Enhanced drop zone components that work with the original ones
const EnhancedPermissionDropZone = ({ 
  title, 
  selectedPermissions, 
  onPermissionDrop, 
  onPermissionRemove, 
  isEditing, 
  allPermissions,
  isOpen,
  onToggle
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className={`flex items-center justify-between p-3 border-b cursor-pointer bg-muted ${isOpen ? 'border-b' : ''}`}
        onClick={onToggle}
      >
        <h3 className="font-medium">{title}</h3>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <PermissionDropZone
          title=""
          selectedPermissions={selectedPermissions}
          onPermissionDrop={onPermissionDrop}
          onPermissionRemove={onPermissionRemove}
          isEditing={isEditing}
          allPermissions={allPermissions}
        />
      </div>
    </div>
  );
};

const EnhancedUserDropZone = ({ 
  title, 
  selectedUsers, 
  onUserDrop, 
  onUserRemove, 
  isEditing, 
  allUsers,
  isOpen,
  onToggle
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className={`flex items-center justify-between p-3 border-b cursor-pointer bg-muted ${isOpen ? 'border-b' : ''}`}
        onClick={onToggle}
      >
        <h3 className="font-medium">{title}</h3>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <UserDropZone
          title=""
          selectedUsers={selectedUsers}
          onUserDrop={onUserDrop}
          onUserRemove={onUserRemove}
          isEditing={isEditing}
          allUsers={allUsers}
        />
      </div>
    </div>
  );
};

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const arePermissionsEqual = (perms1: Permission[] = [], perms2: Permission[] = []) => {
  if (perms1.length !== perms2.length) return false;
  const ids1 = new Set(perms1.map((p) => p.id));
  const ids2 = new Set(perms2.map((p) => p.id));
  if (ids1.size !== ids2.size) return false;
  return [...ids1].every((id) => ids2.has(id));
};

const areUsersEqual = (users1: User[] = [], users2: User[] = []) => {
  if (users1.length !== users2.length) return false;
  const ids1 = new Set(users1.map((u) => u.id));
  const ids2 = new Set(users2.map((u) => u.id));
  if (ids1.size !== ids2.size) return false;
  return [...ids1].every((id) => ids2.has(id));
};

export function RoleCard({ 
  role, 
  onDelete, 
  onUpdateRole, 
  onSavePermissions, 
  onSaveUsers, 
  allPermissions = [], 
  allUsers = [],
  compact = false
}: RoleCardProps) {
  const originalRoleRef = useRef<Role>(deepClone(role));
  const [localRole, setLocalRole] = useState<Role>(deepClone(role));
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(deepClone(role.permissions || []));
  const [selectedUsers, setSelectedUsers] = useState<User[]>(deepClone(role.users || []));
  
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isEditingUsers, setIsEditingUsers] = useState(false);
  const [isStalePermissions, setIsStalePermissions] = useState(false);
  const [isStaleUsers, setIsStaleUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("permissions"); // Default to permissions tab
  
  // State for collapsible sections - both start closed by default
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  
  // Update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [roleName, setRoleName] = useState(role.name);
  const [roleDescription, setRoleDescription] = useState(role.description || "");
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [usersChanged, setUsersChanged] = useState(false);
  
  // Log allPermissions when the component mounts or when it changes
  useEffect(() => {
    console.log("RoleCard received allPermissions:", {
      count: allPermissions.length,
      sample: allPermissions.slice(0, 3),
    });
  }, [allPermissions]);
  
  useEffect(() => {
    console.log("RoleCard received allUsers:", {
      count: allUsers.length,
      sample: allUsers.slice(0, 3),
    });
  }, [allUsers]);
  
  // Automatically open the relevant section when tab changes
  useEffect(() => {
    if (activeTab === "permissions" && !isPermissionsOpen) {
      setIsPermissionsOpen(true);
    } else if (activeTab === "users" && !isUsersOpen) {
      setIsUsersOpen(true);
    }
  }, [activeTab]);
  
  // Automatically open the relevant section when entering edit mode
  useEffect(() => {
    if (isEditingPermissions && !isPermissionsOpen) {
      setIsPermissionsOpen(true);
    }
  }, [isEditingPermissions]);
  
  useEffect(() => {
    if (isEditingUsers && !isUsersOpen) {
      setIsUsersOpen(true);
    }
  }, [isEditingUsers]);
  
  // If new data arrives from the parent
  useEffect(() => {
    const prev = originalRoleRef.current;
    const incoming = role;
    const basicPropsChanged =
      prev.name !== incoming.name || prev.description !== incoming.description || prev.avatarURL !== incoming.avatarURL;
    const permsChanged = !arePermissionsEqual(prev.permissions || [], incoming.permissions || []);
    const usersChanged = !areUsersEqual(prev.users || [], incoming.users || []);
    
    if (basicPropsChanged || permsChanged) {
      setIsStalePermissions(true);
    }
    
    if (basicPropsChanged || usersChanged) {
      setIsStaleUsers(true);
    }
    
    // if not editing permissions or users (and no open update dialog), re-sync
    if (!isEditingPermissions && !isEditingUsers && !updateDialogOpen) {
      setLocalRole(deepClone(incoming));
      setSelectedPermissions(deepClone(incoming.permissions || []));
      setSelectedUsers(deepClone(incoming.users || []));
      setRoleName(incoming.name);
      setRoleDescription(incoming.description || "");
      
      if (isStalePermissions) {
        setIsStalePermissions(false);
      }
      
      if (isStaleUsers) {
        setIsStaleUsers(false);
      }
      
      originalRoleRef.current = deepClone(incoming);
    }
  }, [role, isEditingPermissions, isEditingUsers, updateDialogOpen, isStalePermissions, isStaleUsers]);
  
  // Whenever selectedPermissions changes, check if it differs from original
  useEffect(() => {
    const origPerms = originalRoleRef.current.permissions || [];
    setPermissionsChanged(!arePermissionsEqual(selectedPermissions, origPerms));
  }, [selectedPermissions]);
  
  // Whenever selectedUsers changes, check if it differs from original
  useEffect(() => {
    const origUsers = originalRoleRef.current.users || [];
    setUsersChanged(!areUsersEqual(selectedUsers, origUsers));
  }, [selectedUsers]);
  
  // Called by PermissionDropZone
  const handlePermissionDrop = (permission: Permission) => {
    console.log("Permission received in RoleCard:", permission);
    // Check if this permission is already in the role
    if (!selectedPermissions.some((p) => p.id === permission.id)) {
      const newPerms = [...selectedPermissions, deepClone(permission)];
      console.log("Updated permissions:", newPerms);
      setSelectedPermissions(newPerms);
      setLocalRole((prev) => ({ ...prev, permissions: newPerms }));
      setPermissionsChanged(true); // Explicitly mark as changed
    } else {
      console.log("Permission already exists in role");
    }
  };
  
  // Called by UserDropZone
  const handleUserDrop = (user: User) => {
    console.log("User received in RoleCard:", user);
    if (!selectedUsers.some((u) => u.id === user.id)) {
      const newUsers = [...selectedUsers, deepClone(user)];
      console.log("Updated users:", newUsers);
      setSelectedUsers(newUsers);
      setLocalRole((prev) => ({ ...prev, users: newUsers }));
      setUsersChanged(true);
    } else {
      console.log("User already exists in role");
    }
  };
  
  const handlePermissionRemove = (permission: Permission) => {
    const newPerms = selectedPermissions.filter((p) => p.id !== permission.id);
    setSelectedPermissions(newPerms);
    setLocalRole((prev) => ({ ...prev, permissions: newPerms }));
  };
  
  const handleUserRemove = (user: User) => {
    const newUsers = selectedUsers.filter((u) => u.id !== user.id);
    setSelectedUsers(newUsers);
    setLocalRole((prev) => ({ ...prev, users: newUsers }));
  };
  
  // Toggle permission edit mode
  const handleTogglePermissionsEditMode = () => {
    if (isStalePermissions) return;
    
    if (isEditingPermissions && permissionsChanged) {
      console.log("Saving permissions:", selectedPermissions);
      onSavePermissions?.(localRole.id, selectedPermissions);
      originalRoleRef.current = { ...deepClone(localRole), permissions: deepClone(selectedPermissions) };
      setPermissionsChanged(false);
    }
    
    setIsEditingPermissions(!isEditingPermissions);
    
    // If enabling edit mode, switch to permissions tab and ensure it's open
    if (!isEditingPermissions) {
      setActiveTab("permissions");
      setIsPermissionsOpen(true);
    }
  };
  
  // Toggle users edit mode
  const handleToggleUsersEditMode = () => {
    if (isStaleUsers) return;
    
    if (isEditingUsers && usersChanged) {
      console.log("Saving users:", selectedUsers);
      onSaveUsers?.(localRole.id, selectedUsers);
      originalRoleRef.current = { ...deepClone(localRole), users: deepClone(selectedUsers) };
      setUsersChanged(false);
    }
    
    setIsEditingUsers(!isEditingUsers);
    
    // If enabling edit mode, switch to users tab and ensure it's open
    if (!isEditingUsers) {
      setActiveTab("users");
      setIsUsersOpen(true);
    }
  };
  
  const handleOpenUpdateDialog = () => {
    if (isStalePermissions || isStaleUsers) return;
    setRoleName(localRole.name);
    setRoleDescription(localRole.description || "");
    setUpdateDialogOpen(true);
  };
  
  const handleDelete = () => {
    if (isStalePermissions || isStaleUsers) return;
    onDelete?.(localRole.id);
  };
  
  // Revert everything
  const handleRefresh = () => {
    const fresh = deepClone(role);
    setLocalRole(fresh);
    setSelectedPermissions(deepClone(fresh.permissions || []));
    setSelectedUsers(deepClone(fresh.users || []));
    setRoleName(fresh.name);
    setRoleDescription(fresh.description || "");
    originalRoleRef.current = deepClone(fresh);
    setIsStalePermissions(false);
    setIsStaleUsers(false);
    setIsEditingPermissions(false);
    setIsEditingUsers(false);
    setUpdateDialogOpen(false);
  };
  
  const handleUpdateRole = async () => {
    if (!onUpdateRole || (isStalePermissions || isStaleUsers) || !roleName.trim()) {
      setUpdateDialogOpen(false);
      return;
    }
    
    const changedName = roleName.trim() !== originalRoleRef.current.name;
    const changedDesc = roleDescription.trim() !== (originalRoleRef.current.description || "");
    
    if (changedName || changedDesc) {
      try {
        await updateRoleNameDesc({
          role_id: localRole.id,
          name: changedName ? roleName.trim() : undefined,
          description: changedDesc ? roleDescription.trim() : undefined,
        });
        onUpdateRole(localRole.id, roleName.trim(), roleDescription.trim());
      } catch (error) {
        console.error("Error updating role:", error);
      }
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
      
  const isStale = isStalePermissions || isStaleUsers;
  
  // Render action buttons based on compact mode
  const renderActionButtons = () => {
    if (compact) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(isStale && "opacity-50 cursor-not-allowed")}
              disabled={isStale}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Actions</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleTogglePermissionsEditMode}
              disabled={isStalePermissions}
              className={isStalePermissions ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isEditingPermissions ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Permissions
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Edit Permissions
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleToggleUsersEditMode}
              disabled={isStaleUsers}
              className={isStaleUsers ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isEditingUsers ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Users
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Edit Users
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleOpenUpdateDialog}
              disabled={isStale}
              className={isStale ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Update Role
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isStale}
              className={cn(
                "text-destructive focus:text-destructive",
                isStale && "opacity-50 cursor-not-allowed"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Role
            </DropdownMenuItem>
            
            {isStale && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // Standard mode with individual action buttons
    return (
      <div className="flex items-center gap-2">
        {/* Toggle Edit Permissions */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePermissionsEditMode}
                className={cn(isStalePermissions && "opacity-50 cursor-not-allowed")}
                disabled={isStalePermissions}
                aria-label={isEditingPermissions ? "Save Permissions" : "Edit Permissions"}
              >
                {isEditingPermissions ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Permissions</span>
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
              {isEditingPermissions
                ? isStalePermissions
                  ? "Refresh required before saving"
                  : "Save permission changes"
                : isStalePermissions
                  ? "Refresh required before editing"
                  : "Edit role permissions"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Toggle Edit Users */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleUsersEditMode}
                className={cn(isStaleUsers && "opacity-50 cursor-not-allowed")}
                disabled={isStaleUsers}
                aria-label={isEditingUsers ? "Save Users" : "Edit Users"}
              >
                {isEditingUsers ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Users</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Users</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isEditingUsers
                ? isStaleUsers
                  ? "Refresh required before saving"
                  : "Save user changes"
                : isStaleUsers
                  ? "Refresh required before editing"
                  : "Edit role users"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Update Role */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenUpdateDialog}
                className={cn(isStale && "opacity-50 cursor-not-allowed")}
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
        
        {/* Delete */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className={cn(
                  "text-destructive hover:bg-destructive hover:text-destructive-foreground",
                  isStale && "opacity-50 cursor-not-allowed",
                )}
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
    );
  };
  
  return (
    <>
      <Card className={cn("w-full", isStale && "border-amber-400")}>
        {isStale && (
          <Alert variant="warning" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-b-none">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="flex w-full items-center justify-between">
              <AlertDescription className="text-amber-600 dark:text-amber-300">
                {(isEditingPermissions || isEditingUsers)
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
              <div className="capitalize">
                <h3 className="text-lg font-semibold">{localRole.name}</h3>
                {localRole.description && <p className="text-sm text-muted-foreground">{localRole.description}</p>}
              </div>
            </div>
            {renderActionButtons()}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="permissions">
              <EnhancedPermissionDropZone
                title={isEditingPermissions ? "Editing Role Permissions..." : "Role Permissions"}
                selectedPermissions={selectedPermissions}
                onPermissionDrop={isEditingPermissions && !isStalePermissions ? handlePermissionDrop : undefined}
                onPermissionRemove={isEditingPermissions && !isStalePermissions ? handlePermissionRemove : undefined}
                isEditing={isEditingPermissions}
                allPermissions={allPermissions}
                isOpen={isPermissionsOpen}
                onToggle={() => setIsPermissionsOpen(!isPermissionsOpen)}
              />
              
              {/* If stale while editing permissions */}
              {isEditingPermissions && isStalePermissions && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-md text-amber-700 dark:text-amber-300 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p>Role updated elsewhere. Please refresh before making changes.</p>
                  </div>
                </div>
              )}
              
              {/* If user has unsaved permission changes */}
              {isEditingPermissions && permissionsChanged && !isStalePermissions && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 rounded-md text-blue-700 dark:text-blue-300 text-sm">
                  <p>You've changed permissions. Click "Save Permissions" to apply them.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              <EnhancedUserDropZone
                title={isEditingUsers ? "Editing Role Users..." : "Role Users"}
                selectedUsers={selectedUsers}
                onUserDrop={isEditingUsers && !isStaleUsers ? handleUserDrop : undefined}
                onUserRemove={isEditingUsers && !isStaleUsers ? handleUserRemove : undefined}
                isEditing={isEditingUsers}
                allUsers={allUsers}
                isOpen={isUsersOpen}
                onToggle={() => setIsUsersOpen(!isUsersOpen)}
              />
              
              {/* If stale while editing users */}
              {isEditingUsers && isStaleUsers && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-md text-amber-700 dark:text-amber-300 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p>Role updated elsewhere. Please refresh before making changes.</p>
                  </div>
                </div>
              )}
              
              {/* If user has unsaved user changes */}
              {isEditingUsers && usersChanged && !isStaleUsers && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 rounded-md text-blue-700 dark:text-blue-300 text-sm">
                  <p>You've changed users. Click "Save Users" to apply them.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Update Name/Description Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Role</DialogTitle>
            <DialogDescription>Make changes to the role name and description</DialogDescription>
          </DialogHeader>
          {isStale && (
            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>This role has been updated elsewhere. Refresh before making changes.</AlertDescription>
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
