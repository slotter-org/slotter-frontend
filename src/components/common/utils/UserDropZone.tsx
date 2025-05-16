import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MyBadge } from '@/components/common/badges/MyBadge'
import type { User } from '@/types/user'

interface UserDropZoneProps {
  title: string
  onUserDrop?: (user: User) => void
  onUserRemove?: (user: User) => void
  selectedUsers: User[]
  isEditing: boolean
  allUsers?: User[]
}

export function UserDropZone({
  title,
  onUserDrop,
  onUserRemove,
  selectedUsers,
  isEditing = false,
  allUsers = [],
}: UserDropZoneProps) {
  const [isDropActive, setIsDropActive] = useState(false)

  useEffect(() => {
    console.log("UserDropZone received allUsers:", {
      count: allUsers.length,
      sample: allUsers.slice(0, 3),
    })
  }, [allUsers])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropActive(true)
  }
  const handleDragLeave = () => {
    setIsDropActive(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropActive(false)
    if (!isEditing) return
    try {
      const raw = e.dataTransfer.getData("text/plain")
      if (!raw) {
        console.warn('No data received in drop')
        return
      }
      console.log("Raw drop data:", raw)
      const parsed = JSON.parse(raw)
      if (!parsed || !parsed.id) {
        console.warn("Invalid drop data format", parsed)
        return
      }
      console.log("Looking for user with ID:", parsed.id, "in", allUsers.length, "users")
      const userObj = allUsers.find((u) => u.id === parsed.id)
      if (userObj && onUserDrop) {
        console.log("User found, calling onUserDrop with:", userObj)
        onUserDrop(userObj)
      } else {
        console.warn("User not found in allUsers or onUserDrop not provided", {
          userId: parsed.id,
          allUsersCount: allUsers.length,
          allUserIds: allUsers.map((u) => u.id),
          hasDropHandler: !!onUserDrop,
        })
      }
    } catch (error) {
      console.error("Error parsing dropped user:", error)
    }
  }
  return (
    <Card
      className={`w-full transition-colors ${isDropActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onDragOver={isEditing ? handleDragOver : undefined}
      onDragLeave={isEditing ? handleDragLeave : undefined}
      onDrop={isEditing ? handleDrop : undefined}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`min-h-[150px] rounded-md border-2 border-dashed p-4 transition-colors ${
            isDropActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
        >
          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <MyBadge
                  key={user.id}
                  title={`${user.firstName} ${user.lastName}`}
                  showCloseOnHover={isEditing}
                  onClose={() => onUserRemove?.(user)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Drop users here to assign them
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
