import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MyBadge } from '@/components/common/badges/MyBadge'
import type { Permission } from '@/types/permission'
import { getColorForCategory } from '@/utils/PermissionColors'

interface PermissionDropZoneProps {
  title: string
  onPermissionDrop?: (permission: Permission) => void
  onPermissionRemove?: (permission: Permission) => void
  selectedPermissions: Permission[]
  isEditing?: boolean
  allPermissions?: Permission[]
}

export function PermissionDropZone({
  title,
  onPermissionDrop,
  onPermissionRemove,
  selectedPermissions,
  isEditing = false,
  allPermissions = [],
}: PermissionDropZoneProps) {
  const [isDropActive, setIsDropActive] = useState(false)

  useEffect(() => {
    console.log("PermissionDropZone received allPermissions:", {
      count: allPermissions.length,
      sample: allPermissions.slice(0, 3),
    })
  }, [allPermissions])

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
      console.log("Looking for permission with ID:", parsed.id, "in", allPermissions.length, "permissions")
      const permissionObj = allPermissions.find((p) => p.id === parsed.id)
      if (permissionObj && onPermissionDrop) {
        console.log("Permission found, calling onPermissionDrop with:", permissionObj)
        onPermissionDrop(permissionObj)
      } else {
        console.warn("Permission not found in allPermissions or onPermissionDrop not provided", {
          permissionId: parsed.id,
          allPermissionsCount: allPermissions.length,
          allPermissionIds: allPermissions.map((p) => p.id),
          hasDropHandler: !!onPermissionDrop,
        })
      }
    } catch (error) {
      console.error("Error parsing dropped permission:", error)
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
          {selectedPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedPermissions.map((permission) => (
                <MyBadge
                  key={permission.id}
                  title={permission.name}
                  color={getColorForCategory(permission.category)}
                  showCloseOnHover={isEditing}
                  onClose={() => onPermissionRemove?.(permission)}
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
