import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRole } from "@/api/RoleService"

interface RoleCreateDialogProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function RoleCreateDialog({ trigger, onSuccess }: RoleCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!roleName.trim()) return

    try {
      setIsSubmitting(true)

      // Call the real API
      const response = await createRole({
        name: roleName.trim(),
        description: roleDescription.trim(),
      })

      console.log("Role created:", response.message)

      // Reset form and close dialog
      setRoleName("")
      setRoleDescription("")
      setOpen(false)

      // Call success callback
      onSuccess?.()
    } catch (error) {
      console.error("Error creating role:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>Create a new role with a name and description.</DialogDescription>
        </DialogHeader>
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
              placeholder="Admin, Editor, Viewer, etc."
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
              placeholder="Describe the role's purpose and permissions"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !roleName.trim()}>
            {isSubmitting ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

