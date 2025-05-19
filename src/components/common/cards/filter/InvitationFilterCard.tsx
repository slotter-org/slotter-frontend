import { useState, useMemo } from 'react'
import { Search, Filter, Plus, Ticket } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InvitationCard } from '@/components/common/cards/InvitationCard'
import type { Invitation } from '@/types/invitation'

interface InvitationFilterCardProps {
  invitations: Invitation[]
  onResendInvitation?: (invitationId: string) => Promise<void>
  onCancelInvitation?: (invitationId: string) => Promise<void>
  onExpireInvitation?: (invitationId: string) => Promise<void>
  className?: string
  isLoading?: boolean
}

export function InvitationFilterCard({ invitations, onResendInvitation, onCancelInvitation, onExpireInvitation, className, isLoading = false }: InvitationFilterCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    invitations.forEach((invitation) => {
      if (invitation.status) {
        statuses.add(invitation.status)
      }
    })
    return ["all", ...Array.from(statuses)]
  }, [invitations])
  
  const typeOptions = useMemo(() => {
    const types = new Set<string>()
    invitations.forEach((invitation) => {
      if (invitation.invitationType) {
        types.add(invitation.invitationType)
      }
    })
    return ["all", ...Array.from(types)]
  }, [invitations])

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invitation) => {
      const matchesSearch =
        searchQuery === "" ||
        (invitation.name && invitation.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (invitation.email && invitation.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (invitation.phoneNumber && invitation.phoneNumber.includes(searchQuery))
      const matchesStatus = statusFilter === "all" || invitation.status === statusFilter
      const matchesType = typeFilter === "all" || invitation.invitationType === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [invitations, searchQuery, statusFilter, typeFilter])

  const finalInvitations = useMemo(() => {
    return [...filteredInvitations].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1
      if (a.status !== "pending" && b.status === "pending") return 1
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
  }, [filteredInvitations])

    if (isLoading) {
    return (
      <Card className={`${className ?? ''} h-full flex flex-col`}>
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col flex-1 overflow-hidden p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="flex-1">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={`${className ?? ''} h-full flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Invitations
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {finalInvitations.length} of {invitations.length} invitations
          </div>
          {onCreateInvitation && (
            <Button size="sm" onClick={onCreateInvitation}>
              <Plus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden p-6">
        {/* Search Bar */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invitations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 shrink-0">
          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Type Filter */}
          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" 
                      ? "All Types" 
                      : type === "join_company" 
                        ? "Join Company" 
                        : type === "join_wms" 
                          ? "Join WMS" 
                          : type === "join_wms_with_new_company" 
                            ? "Join WMS With Company" 
                            : type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(statusFilter !== "all" || typeFilter !== "all") && (
          <div className="flex flex-wrap gap-2 text-sm mb-4 shrink-0">
            <span className="text-muted-foreground">Active filters:</span>
            {statusFilter !== "all" && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
            )}
            {typeFilter !== "all" && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                Type: {typeFilter === "join_company" 
                  ? "Join Company" 
                  : typeFilter === "join_wms" 
                    ? "Join WMS" 
                    : typeFilter === "join_wms_with_new_company" 
                      ? "Join WMS With Company" 
                      : typeFilter.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )}
          </div>
        )}
        
        {/* Invitations List */}
        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-4">
            {finalInvitations.length > 0 ? (
              finalInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onResend={onResendInvitation}
                  onCancel={onCancelInvitation}
                  onExpire={onExpireInvitation}
                />
              ))
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                No invitations found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
