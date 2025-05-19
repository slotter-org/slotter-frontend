import type React from "react"
import { useState, useEffect } from "react"
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendInvitation } from "@/api/InvitationService"
import { useMyCompany } from "@/contexts/MyCompanyProvider"
import { Mail, Phone } from "lucide-react"
import type { InvitationType } from "@/types/invitation"

interface InvitationCreateDialogProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function InvitationCreateDialog({ trigger, onSuccess }: InvitationCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [name, setName] = useState("")
  const [invitationType, setInvitationType] = useState<InvitationType>("join_company")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { myRoles } = useMyCompany()
  const [selectedRole, setSelectedRole] = useState<string>("")
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])
  
  // If roles are available, preselect the first one
  useEffect(() => {
    if (myRoles && myRoles.length > 0 && !selectedRole) {
      setSelectedRole(myRoles[0].id)
    }
  }, [myRoles, selectedRole])
  
  const resetForm = () => {
    setContactMethod("email")
    setEmail("")
    setPhoneNumber("")
    setName("")
    setInvitationType("join_company")
    setMessage("")
    if (myRoles && myRoles.length > 0) {
      setSelectedRole(myRoles[0].id)
    } else {
      setSelectedRole("")
    }
  }
  
  const validateForm = () => {
    if (contactMethod === "email" && !email.trim()) {
      return false
    }
    if (contactMethod === "phone" && !phoneNumber.trim()) {
      return false
    }
    return true
  }
  
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      
      // Prepare request based on contact method
      const requestData = {
        invitation_type: invitationType,
        name: name.trim() || undefined,
        message: message.trim() || undefined,
      }
      
      if (contactMethod === "email") {
        Object.assign(requestData, { email: email.trim() })
      } else {
        Object.assign(requestData, { phone_number: phoneNumber.trim() })
      }
      
      // Send invitation
      const response = await sendInvitation(requestData as any)
      console.log("Invitation sent:", response.message)
      
      // If role was selected and we have an invitation ID, update the role
      // Note: This depends on whether your API returns the invitation ID in the response
      // If it does, you could use that to update the role in a second call
      
      // Reset form and close dialog
      resetForm()
      setOpen(false)
      
      // Call success callback
      onSuccess?.()
    } catch (error) {
      console.error("Error sending invitation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getInvitationTypeText = (type: InvitationType) => {
    switch (type) {
      case "join_company":
        return "Join Company"
      case "join_wms":
        return "Join WMS"
      case "join_wms_with_new_company":
        return "Join WMS with New Company"
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Invite someone to join your organization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Contact Method Tabs */}
          <Tabs value={contactMethod} onValueChange={(value) => setContactMethod(value as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="person@example.com"
                />
              </div>
            </TabsContent>
            <TabsContent value="phone" className="pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="col-span-3"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name (optional)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Recipient's name"
            />
          </div>
          
          {/* Invitation Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="invitation-type" className="text-right">
              Invitation Type
            </Label>
            <Select value={invitationType} onValueChange={(value) => setInvitationType(value as InvitationType)}>
              <SelectTrigger id="invitation-type" className="col-span-3">
                <SelectValue placeholder="Select invitation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="join_company">{getInvitationTypeText("join_company")}</SelectItem>
                <SelectItem value="join_wms">{getInvitationTypeText("join_wms")}</SelectItem>
                <SelectItem value="join_wms_with_new_company">{getInvitationTypeText("join_wms_with_new_company")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Role Selection - Only show for company invitations */}
          {invitationType === "join_company" && myRoles && myRoles.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {myRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Message */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message (optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              placeholder="Add a personal message to your invitation"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !validateForm()}
          >
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
