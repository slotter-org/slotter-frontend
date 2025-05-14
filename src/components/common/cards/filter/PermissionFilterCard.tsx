import React, { useState, useMemo } from 'react';
import { Search, Filter, GripHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MyBadge } from '@/components/common/badges/MyBadge';
import type { Permission } from '@/types/permission';
import { getColorForCategory } from '@/utils/PermissionColors';

interface PermissionFilterCardProps {
  permissions: Permission[]
  onDragPermission?: (permission: Permission) => void
}

export function PermissionFilterCard({ permissions, onDragPermission }: PermissionFilterCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const categories = useMemo(() => {
    const uniqueCategories = new Set(permissions.map((p) => p.category))
    return ["all", ...Array.from(uniqueCategories)]
  }, [permissions])

  const actions = useMemo(() => {
    const uniqueActions = new Set(permissions.map((p) => p.action))
    return ["all", ...Array.from(uniqueActions)]
  }, [permissions])

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.action.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
      const matchesAction = actionFilter === "all" || p.action === actionFilter
      return matchesSearch && matchesCategory && matchesAction
    })
  }, [permissions, searchQuery, categoryFilter, actionFilter])

  // onDragStart callback
  const handleDragStart = (permission: Permission) => {
    console.log(`[PermissionFilterCard] Dragging permission:`, permission)
    onDragPermission?.(permission)
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Permissions</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <GripHorizontal className="h-4 w-4" />
          <span>Drag to assign</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Action" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === "all" ? "All Actions" : action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Permission Badges */}
        <div className="mt-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredPermissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredPermissions.map((permission) => (
                  <MyBadge
                    key={permission.id}
                    title={permission.name}
                    color={getColorForCategory(permission.category)}
                    showCloseOnHover={false}
                    draggable={true}
                    // Make sure we're passing the correct ID
                    dragData={{ id: permission.id }}
                    onDragStart={() => handleDragStart(permission)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No permissions found.</div>
            )}
          </ScrollArea>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredPermissions.length} of {permissions.length} permissions
        </div>
      </CardContent>
    </Card>
  )
}

