import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, Filter, Badge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleCard } from '@/components/common/cards/RoleCard';
import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { useViewport } from '@/contexts/ViewportProvider';

interface RoleCardFilterProps {
  roles: Role[]
  onSavePermissions?: (roleId: string, permissions: Permission[]) => void
  onDeleteRole?: (roleId: string) => void
  onUpdateRole?: (roleId: string, newName: string, newDesc: string) => void
  className?: string
  // Add allPermissions prop
  allPermissions?: Permission[]
}

export function RoleCardFilter({
  roles,
  onSavePermissions,
  onDeleteRole,
  onUpdateRole,
  className,
  allPermissions = [],
}: RoleCardFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [offsetTop, setOffsetTop] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

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

  return (
    <Card className={`${className ?? ''} h-full flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Badge className="h-5 w-5" />
          Roles
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {finalRoles.length} of {roles.length} roles
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Active Filters Display */}
        {(categoryFilter !== "all" || actionFilter !== "all") && (
          <div className="flex flex-wrap gap-2 text-sm">
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
        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollRef} className="pr-4">
            <div className="space-y-4">
              {finalRoles.length > 0 ? (
                finalRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onSavePermissions={onSavePermissions}
                    onDelete={onDeleteRole}
                    onUpdateRole={onUpdateRole}
                    // Pass allPermissions to each RoleCard
                    allPermissions={allPermissions}
                  />
                ))
              ) : (
                <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                  No roles found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

