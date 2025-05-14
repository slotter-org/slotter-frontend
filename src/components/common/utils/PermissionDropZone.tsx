import type React from 'react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MyBadge } from '@/components/common/badges/MyBadge'
import type { Permission } from '@/types/permission'

interface PermissionDropZoneProps {
  title: string
  onPermissionDrop?: (permission: Permission) => void
  onPermissionRemove?: (permission: Permission) => void
  selectedPermissions: Permission[]
  isEditing?: boolean
}

export function PermissionDropZone({
  title,
  onPermissionDrop,
  onPermissionRemove,
  selectedPermissions,
  isEditing,
}: PermissionDropZoneProps) {
  const [isDropActive, setIsDropActive] = useState(false)
  const getColorForCategory = (category: string): string => {
    switch (category) {
      case 'avatar':
        return "#3b82f6"
      case 'invitations':
        return "#10b981"
      case 'roles':
        return "#ef4444"
      default:
        return "#8b5cf6"
    }
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropActive(true)
  }
  const handleDragLeave = () => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropActive(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropActive(false)
    try {
      const permissionData = JSON.parse(e.dataTransfer.getData("text/plain"))
      if (permissionData && onPermissionDrop) {
        onPermissionDrop(permissionData)
      }
    } catch (error) {
      console.error("Error parsing dropped permission:", error)
    }
  }

  return (
    <Card
      className={`w-full transition-colors ${isDropActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`min-h-[150px] rounded-md border-2 border-dashed p-4 transition-colors ${isDropActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
        >
          {selectedPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedPermissions.map((permission) => (
                <MyBadge
                  key={permission.id}
                  title={permission.name}
                  color={getColorForCategory(permission.category)}
                  showCloseOnHover={isEditing}
                  onClose={() => onPermissionRemove && onPermissionRemove(permission)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Drop permissions here to assign them
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

