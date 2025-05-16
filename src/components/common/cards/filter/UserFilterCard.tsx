import React, { useState, useMemo } from 'react'
import { Search, Filter, GripHorizontal } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MyBadge } from '@/components/common/badges/MyBadge'
import type { User } from '@/types/user'
import type { Role } from '@/types/role'

interface UserFilterCardProps {
  users: User[]
  roles: Role[]
  onDragUser?: (user: User) => void
  className?: string
}

export function UserFilterCard({ users, roles, onDragUser, className }: UserFilterCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  
  const roleOptions = useMemo(() => {
    const roleMap = new Map<string, string>()
    roles.forEach((role) => {
      roleMap.set(role.id, role.name)
    })
    users.forEach((user) => {
      if (user.roleID && !roleMap.has(user.roleID) && user.role?.name) {
        roleMap.set(user.roleID, user.role.name)
      }
    })
    return [
      { id: "all", name: "All Roles" },
      ...Array.from(roleMap.entries()).map(([id, name]) => ({ id, name}))
    ]
  }, [roles, users])
  
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.roleID === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])
  
  const handleDragStart = (user: User) => {
    console.log(`[UserFilterCard] Dragging user:`, user)
    onDragUser?.(user)
  }
  
  return (
    <Card className={`w-full h-full flex flex-col ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between shrink-0">
        <CardTitle>Users</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <GripHorizontal className="h-4 w-4" />
          <span>Drag to assign</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden p-6">
        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filters */}
        <div className="flex gap-4 mb-4 shrink-0">
          <div className="flex-1">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* User Badges */}
        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredUsers.map((user) => (
                  <MyBadge
                    key={user.id}
                    title={`${user.firstName} ${user.lastName}`}
                    img={user.avatarURL} 
                    imgFallback={`${user.firstName[0]}${user.lastName[0]}`}
                    color="#64748b"
                    showCloseOnHover={false}
                    draggable={true}
                    dragData={{ id: user.id }}
                    onDragStart={() => handleDragStart(user)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="text-xs text-muted-foreground mt-2 shrink-0">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </CardContent>
    </Card>
  )
}
