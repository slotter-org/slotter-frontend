import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, Filter, Badge, List, Grid } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleCard } from '@/components/common/cards/RoleCard';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import type { User } from '@/types/user';
import { useViewport } from '@/contexts/ViewportProvider';

interface RoleCardFilterProps {
  roles: Role[]
  onSavePermissions?: (roleId: string, permissions: Permission[]) => void
  onSaveUsers?: (roleId: string, users: User[]) => void
  onDeleteRole?: (roleId: string) => void
  onUpdateRole?: (roleId: string, newName: string, newDesc: string) => void
  className?: string
  // Add allPermissions prop
  allPermissions?: Permission[]
  allUsers?: User[]
}

export function RoleCardFilter({
  roles,
  onSavePermissions,
  onSaveUsers,
  onDeleteRole,
  onUpdateRole,
  className,
  allPermissions = [],
  allUsers = [],
}: RoleCardFilterProps) {
  const { isBelowSm, isBelowMd, isBelowLg, isBelowXl, isBelowXxl } = useViewport()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [isGridView, setIsGridView] = useState(false);
  const [rolesCompact, setRolesCompact] = useState(false);
  const [roleButtonTitles, setRoleButtonTitles] = useState(true);
  const [showGridButton, setShowGridButton] = useState(true);
  
  const permissionCategories = useMemo(() => {
    const categories = new Set<string>()
    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        categories.add(permission.category)
      })
    })
    return ["all", ...Array.from(categories)]
  }, [roles])
  
  const permissionActions = useMemo(() => {
    const actions = new Set<string>()
    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        actions.add(permission.action)
      })
    })
    return ["all", ...Array.from(actions)]
  }, [roles])
  
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = searchQuery === "" || role.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || role.permissions?.some((p) => p.category === categoryFilter)
      const matchesAction = actionFilter === "all" || role.permissions?.some((p) => p.action === actionFilter)
      return matchesSearch && matchesCategory && matchesAction
    })
  }, [roles, searchQuery, categoryFilter, actionFilter])
  
  // Sort by number of permissions (descending)
  const finalRoles = useMemo(() => {
    return [...filteredRoles].sort((a, b) => {
      const aCount = a.permissions?.length || 0
      const bCount = b.permissions?.length || 0
      return bCount - aCount
    })
  }, [filteredRoles])
  
  // Log the allPermissions to verify it's being passed correctly
  console.log("RoleCardFilter received allPermissions:", {
    count: allPermissions.length,
    sample: allPermissions.slice(0, 3),
  })

  //const SM_BREAKPOINT = 640;
  //const MD_BREAKPOINT = 768;
  //const LG_BREAKPOINT = 1024;
  //const XL_BREAKPOINT = 1280;
  //const XXL_BREAKPOINT = 1536;
  //
  useEffect(() => {
    if (isBelowSm) {
      setRolesCompact(false);
      setIsGridView(false);
      setRoleButtonTitles(false);
      setShowGridButton(false);
    }
    else if (isBelowMd) {
      if (isGridView) {
        setRolesCompact(true);
        setRoleButtonTitles(true);
        setshowGridButton(true);
      }
      setRolesCompact(false);
      setRoleButtonTitles(false);
      setShowGridButton(true);
    }
    else if (isBelowLg && !isBelowMd) {
      if (isGridView) {
        setRolesCompact(true);
        setRoleButtonTitles(false);
        setShowGridButton(true);
      } else {
        setRolesCompact(false);
        setRoleButtonTitles(false);
        setShowGridButton(true);
      }
    }
    else if (isBelowXl && !isBelowLg) {
      if (isGridView) {
        setRolesCompact(true);
        setRoleButtonTitles(false);
        setShowGridButton(true);
      } else {
        setRolesCompact(false);
        setRoleButtonTitles(true);
        setShowGridButton(true);
      }
    }
    else if (!isBelowXl) {
      if (isGridView) {
        setRolesCompact(false);
        setRoleButtonTitles(false);
        setShowGridButton(true);
      }
      setRolesCompact(false);
      setRoleButtonTitles(true);
      setShowGridButton(true);
    }
  }, [isBelowSm, isBelowMd, isBelowLg, isBelowXl, isBelowXxl]);

  const handleToggleGridView = () => {
    if (showGridButton) {
      setIsGridView(!isGridView);
    }
  };
  
  const gridColumns = useMemo(() => {
    if (isBelowMd) return 1;
    if (isBelowLg) return 2;
    return 2;
  }, [isBelowMd, isBelowLg]);
  
  return (
    <Card className={`${className ?? ''} h-full flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Badge className="h-5 w-5" />
          Roles
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {finalRoles.length} of {roles.length} roles
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden p-6">
        {/* Search Bar */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-4 mb-4 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Category Filter */}
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {permissionCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Action Filter */}
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by Action" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {permissionActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action === "all" ? "All Actions" : action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {showGridButton && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleGridView}
              title={isGridView ? "Switch to List View" : "Switch to Grid View"}
            >
              {isGridView ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          )}
        </div>
          {/* Active Filters Display */}
        {(categoryFilter !== "all" || actionFilter !== "all") && (
          <div className="flex flex-wrap gap-2 text-sm mb-4 shrink-0">
            <span className="text-muted-foreground">Active filters:</span>
            {categoryFilter !== "all" && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">Category: {categoryFilter}</span>
            )}
            {actionFilter !== "all" && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">Action: {actionFilter}</span>
            )}
          </div>
        )}
        {/* Roles List */}
        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className={isGridView
            ? `grid grid-cols-1 ${gridColumns > 1 ? 'md:grid-cols-2' : ''} ${gridColumns > 2 ? 'lg:grid-cols-3' : ''} gap-4`
            : "space-y-4"
          }>
            {finalRoles.length > 0 ? (
              finalRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onSavePermissions={onSavePermissions}
                  onSaveUsers={onSaveUsers}
                  onDelete={onDeleteRole}
                  onUpdateRole={onUpdateRole}
                  // Pass allPermissions to each RoleCard
                  allPermissions={allPermissions}
                  allUsers={allUsers}
                  compact={rolesCompact}
                  showButtonTitles={roleButtonTitles}
                />
              ))
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                No roles found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
