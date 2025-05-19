import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, CheckCircle, RefreshCw, X, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CountdownTimer } from '@/components/common/utils/CountdownTimer'
import { MyBadge } from '@/components/common/badges/MyBadge'
import { getColorForInvitation } from '@/utils/PermissionColors'
import { cn } from '@/lib/utils'
import type { Invitation } from '@/types/invitation'

interface InvitationCardProps {
  invitation: Invitation
  onResend?: (invitationId: string) => void
  onCancel?: (invitationId: string) => void
  onExpire?: (invitationId: string) => void
}

export function InvitationCard({ invitation, onResend, onCancel, onExpire }: InvitationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Reset loading state when invitation props change
  useEffect(() => {
    setIsLoading(false)
  }, [invitation.status])
  
  const handleResend = async () => {
    if (!onResend) return
    setIsLoading(true)
    try {
      await onResend(invitation.id)
      // Loading state will be reset by the useEffect when props change
    } catch (error) {
      console.error("Error resending invitation:", error)
      setIsLoading(false)
    }
  }
  
  const handleCancel = async () => {
    if (!onCancel) return
    setIsLoading(true)
    try {
      await onCancel(invitation.id)
      // Loading state will be reset by the useEffect when props change
    } catch (error) {
      console.error("Error canceling invitation:", error)
      setIsLoading(false)
    }
  }
  
  const handleExpire = () => {
    if (!onExpire) return
    setIsLoading(true)
    try {
      onExpire?.(invitation.id)
      // Loading state will be reset by the useEffect when props change
    } catch (error) {
      console.error("Error expiring invitation:", error)
      setIsLoading(false)
    }
  }
  
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
      
  const getStatusBadge = () => {
    const status = invitation.status
    const color = getColorForInvitation(status)
    return <MyBadge title={status.charAt(0).toUpperCase() + status.slice(1)} color={color} />
  }
  
  const getInvitationTypeBadge = () => {
    let title = ""
    let color = "#6366f1"
    switch (invitation.invitationType) {
      case "join_company":
        title = "Join Company"
        color = "#8b5cf6"
        break
      case "join_wms":
        title = "Join Wms"
        color = "#0ea5e9"
        break
      case "join_wms_with_new_company":
        title = "Join Wms With New Company"
        color = "#14b8ac"
        break
    }
    return <MyBadge title={title} color={color} />
  }
  
  const getTimeInfo = () => {
    const status = invitation.status
    if (status === "pending" && invitation.expiresAt) {
      return (
        <div className="flex items-center mt-1.5">
          <CountdownTimer expiresAt={invitation.expiresAt} onExpire={handleExpire} className="text-xs" />
        </div>
      )
    }
    if (status === "accepted" && invitation.acceptedAt) {
      return (
        <div className="flex items-center text-green dark:text-green-400 text-xs mt-1.5">
          <CheckCircle className="h-3 w-3 mr-1.5" />
          <span>Accepted {formatDistanceToNow(new Date(invitation.acceptedAt))} ago</span>
        </div>
      )
    }
    if (status === "canceled" && invitation.canceledAt) {
      return (
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mt-1.5">
          <X className="h-3 w-3 mr-1.5" />
          <span>Canceled {formatDistanceToNow(new Date(invitation.canceledAt))} ago</span>
        </div>
      )
    }
    if (status === "expired" && (invitation.expiredAt || invitation.expiresAt)) {
      const expiredDate = invitation.expiredAt ? new Date(invitation.expiredAt) : new Date(invitation.expiresAt!)
      return (
        <div className="flex items-center text-red-600 dark:text-red-400 text-xs mt-1.5">
          <AlertTriangle className="h-3 w-3 mr-1.5" />
          <span>Expired {formatDistanceToNow(expiredDate)} ago</span>
        </div>
      )
    }
    if (status === "rejected" && invitation.rejectedAt) {
      return (
        <div className="flex items-center text-pink-600 dark:text-pink-400 text-xs mt-1.5">
          <X className="h-3 w-3 mr-1.5" />
          <span>Rejected {formatDistanceToNow(new Date(invitation.rejectedAt))} ago</span>
        </div>
      )
    }
    return null
  }
  
  const getActionButtons = () => {
    const status = invitation.status
    if (status === "pending") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      )
    }
    if (status === "canceled" || status === "expired" || status === "rejected") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isLoading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Resend
        </Button>
      )
    }
    return null
  }
  
  const getContactInfo = () => {
    if (invitation.email) {
      return (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{invitation.email}</span>
        </div>
      )
    }
    if (invitation.phoneNumber) {
      return (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>{invitation.phoneNumber}</span>
        </div>
      )
    }
    return null
  }
  
  const getCreatedInfo = () => {
    if (invitation.createdAt) {
      return (
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>Created {formatDistanceToNow(new Date(invitation.createdAt))} ago</span>
        </div>
      )
    }
    return null
  }
  
  const getCardBorderClass = () => {
    const status = invitation.status
    switch (status) {
      case "pending":
        return "border-amber-200 dark:border-amber-800"
      case "accepted":
        return "border-green-200 dark:border-green-800" 
      case "canceled":
        return "border-red-200 dark:border-red-800"
      case "expired":
        return "border-gray-200 dark:border-gray-800"
      case "rejected":
        return "border-pink-200 dark:border-pink-800"
      default:
        return ""
    }
  }
  
  const getName = () => {
    if (invitation.name) return invitation.name
    return "Unnamed Invitation"
  }
  
  const getAvatarUrl = () => {
    return invitation.avatarURL
  }
  
  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 overflow-hidden group",
        getCardBorderClass(),
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 ">
              {getAvatarUrl() ? (
                <AvatarImage src={getAvatarUrl() || "/placeholder.svg"} alt={getName()} />
              ) : (
                <AvatarFallback className="text-lg font-medium">
                  {getName() ? getInitials(getName()) : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-base">{getName()}</h3>
                {getStatusBadge()}
              </div>
              {getContactInfo()}
              {getTimeInfo()}
              {getCreatedInfo()}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getInvitationTypeBadge()}
            {getActionButtons()}
          </div>
        </div>
        {invitation.message && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-3 border-dashed">
            <p className="italic leading-relaxed">
              {'"'}
              {invitation.message}
              {'"'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
