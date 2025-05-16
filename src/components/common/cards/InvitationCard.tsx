import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, CheckCircle, RefreshCw, X, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CountdownTimer } from '@/components/common/utils/CountdownTimer'
import { MyBadge } from '@/components/common/badges/MyBadge'
import { cn } from '@/lib/utils'
import type { Invitation } from '@/types/invitation'
import type { Role } from '@/types/role'

interface InvitationCardProps {
  invitation: Invitation
  onResend?: (invitationId: string) => void
  onCancel?: (invitationId: string) => void
  onExpire?: (invitationId: string) => void
  allRoles?: Role[]
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj))

const areStatusEqual = (invitation1: Invitation, invitation2: Invitation) => {
  if (invitiation1.status !== invitation2.status) {
    return false
  } else {
    return true
  }
}

export function InvitationCard({ invitation, onResend, onCancel, onExpire, allRoles = [] }: InvitationCardProps) {
  const originalInvitationRef = useRef<Invitation>(deepClone(invitation))
  const [localInvitation, setLocalInvitation] = useState<Invitation>(deepClone(invitation))
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(deepClone(invitation.role || []))
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    console.log("Invitation Card received allRoles:", {
      count: allRoles.length,
      sample: allRoles.slice(0, 1),
    })
  }, [allRoles])

  useEffect(() => {
    const prev = originalInvitationRef.current
    const incoming = invitation
    const basicPropsChanged =
      prev.name !== incoming.name || prev.description !== incoming.description || prev.avatarURL !== incoming.avatarURL
    const statusChanged = !areStatusEqual(prev, incoming)
    const roleChanged = !areRolesEqual(prev, incoming)

    if (basicPropsChanged || statusChanged || roleChanged) {
      setIsStale(true)
    }
  })
}
