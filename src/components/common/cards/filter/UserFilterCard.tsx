import React, { useState, useMemo } from 'react'
import { Search, Filter, GripHorizontal } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MyBadge } from '@/components/common/badges/MyBadge'
import type { User } from '@/types/user'


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
    console.log(`[UserFilterCard] Dragging User:`, User)
    onDragUser?.(user)
  }
  return (
   <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users</CardTitle>
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
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
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
        <div className="mt-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredUsers.map((user) => (
                  <MyBadge
                    key={user.id}
                    title={`${user.firstName} ${user.lastName}`}
                    img={user.avatarURL}
                    color="#64748b"
                    showCloseOnHover={false}
                    draggable={true}
                    // Make sure we're passing the correct ID
                    dragData={{ id: user.id }}
                    onDragStart={() => handleDragStart(user)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No permissions found.</div>
            )}
          </ScrollArea>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} permissions
        </div>
      </CardContent>
    </Card>
  )
}
