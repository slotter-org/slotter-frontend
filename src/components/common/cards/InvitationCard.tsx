import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, CheckCircle, RefreshCw, X, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from "@/components/ui/alert"
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

// Deep clone helper for comparing current and previous states
const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj))

export function InvitationCard({ invitation, onResend, onCancel, onExpire }: InvitationCardProps) {
  const originalInvitationRef = useRef<Invitation>(deepClone(invitation))
  const [localInvitation, setLocalInvitation] = useState<Invitation>(deepClone(invitation))
  const [isLoading, setIsLoading] = useState(false)
  const [isStale, setIsStale] = useState(false)

  // Effect to detect changes from props and update local state
  useEffect(() => {
    const prev = originalInvitationRef.current
    const incoming = invitation
    
    // Check if important properties have changed
    const statusChanged = prev.status !== incoming.status
    const canceledAtChanged = prev.canceledAt !== incoming.canceledAt
    const basicPropsChanged = 
      prev.name !== incoming.name || 
      prev.email !== incoming.email || 
      prev.expiresAt !== incoming.expiresAt ||
      prev.expiredAt !== incoming.expiredAt ||
      prev.acceptedAt !== incoming.acceptedAt ||
      prev.rejectedAt !== incoming.rejectedAt
    
    if (statusChanged || canceledAtChanged || basicPropsChanged) {
      if (isLoading) {
        // We're in the middle of an operation, just mark as stale
        setIsStale(true)
      } else {
        // Not doing anything, update our state
        setLocalInvitation(deepClone(incoming))
        originalInvitationRef.current = deepClone(incoming)
        setIsStale(false)
      }
    }
  }, [invitation, isLoading])

  const handleResend = async () => {
    if (!onResend) return
    setIsLoading(true)
    try {
      await onResend(invitation.id)
      // Don't update state here - wait for the prop change to trigger the effect
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
      // Don't update state here - wait for the prop change to trigger the effect
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
      // Don't update state here - wait for the prop change to trigger the effect
    } catch (error) {
      console.error("Error expiring invitation:", error)
      setIsLoading(false)
    }
  }

  // Update local state if stale but not loading
  const handleRefresh = () => {
    if (isStale && !isLoading) {
      setLocalInvitation(deepClone(invitation))
      originalInvitationRef.current = deepClone(invitation)
      setIsStale(false)
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
    const status = localInvitation.status
    const color = getColorForInvitation(status)
    return <MyBadge title={status.charAt(0).toUpperCase() + status.slice(1)} color={color} />
  }

  const getInvitationTypeBadge = () => {
    let title = ""
    let color = "#6366f1"
    switch (localInvitation.invitationType) {
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
    const status = localInvitation.status
    if (status === "pending" && localInvitation.expiresAt) {
      return (
        <div className="flex items-center mt-1.5">
          <CountdownTimer expiresAt={localInvitation.expiresAt} onExpire={handleExpire} className="text-xs" />
        </div>
      )
    }
    if (status === "accepted" && localInvitation.acceptedAt) {
      return (
        <div className="flex items-center text-green dark:text-green-400 text-xs mt-1.5">
          <CheckCircle className="h-3 w-3 mr-1.5" />
          <span>Accepted {formatDistanceToNow(new Date(localInvitation.acceptedAt))} ago</span>
        </div>
      )
    }
    if (status === "canceled" && localInvitation.canceledAt) {
      return (
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mt-1.5">
          <X className="h-3 w-3 mr-1.5" />
          <span>Canceled {formatDistanceToNow(new Date(localInvitation.canceledAt))} ago</span>
        </div>
      )
    }
    if (status === "expired" && (localInvitation.expiredAt || localInvitation.expiresAt)) {
      const expiredDate = localInvitation.expiredAt ? new Date(localInvitation.expiredAt) : new Date(localInvitation.expiresAt!)
      return (
        <div className="flex items-center text-red-600 dark:text-red-400 text-xs mt-1.5">
          <AlertTriangle className="h-3 w-3 mr-1.5" />
          <span>Expired {formatDistanceToNow(expiredDate)} ago</span>
        </div>
      )
    }
    if (status === "rejected" && localInvitation.rejectedAt) {
      return (
        <div className="flex items-center text-pink-600 dark:text-pink-400 text-xs mt-1.5">
          <X className="h-3 w-3 mr-1.5" />
          <span>Rejected {formatDistanceToNow(new Date(localInvitation.rejectedAt))} ago</span>
        </div>
      )
    }
    return null
  }

  const getActionButtons = () => {
    const status = localInvitation.status
    if (status === "pending") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
          onClick={handleCancel}
          disabled={isLoading || isStale}
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
          disabled={isLoading || isStale}
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
    if (localInvitation.email) {
      return (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{localInvitation.email}</span>
        </div>
      )
    }
    if (localInvitation.phoneNumber) {
      return (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>{localInvitation.phoneNumber}</span>
        </div>
      )
    }
    return null
  }

  const getCreatedInfo = () => {
    if (localInvitation.createdAt) {
      return (
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>Created {formatDistanceToNow(new Date(localInvitation.createdAt))} ago</span>
        </div>
      )
    }
    return null
  }

  const getCardBorderClass = () => {
    const status = localInvitation.status
    if (isStale) return "border-amber-400"
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
    if (localInvitation.name) return localInvitation.name
    return "Unnamed Invitation"
  }

  const getAvatarUrl = () => {
    return localInvitation.avatarURL
  }

  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 overflow-hidden group",
        getCardBorderClass(),
      )}
    >
      {isStale && (
        <Alert variant="warning" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-b-none">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <div className="flex w-full items-center justify-between">
            <AlertDescription className="text-amber-600 dark:text-amber-300">
              This invitation has been updated elsewhere. Refresh to see the latest data.
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4 border-amber-500 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </Alert>
      )}
      
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
        {localInvitation.message && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-3 border-dashed">
            <p className="italic leading-relaxed">
              {'"'}
              {localInvitation.message}
              {'"'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
