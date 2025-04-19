import React, { useContext, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/types/user'
import type { Company } from '@/types/company'
import type { Wms } from '@/types/wms'
import { MeContext } from '@/contexts/MeProvider'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export interface AvatarDropdownProps {
  type: "user" | "company" | "wms"
  user?: User | null
  company?: Company | null
  wms?: Wms | null
  mine?: boolean
  size?: number
  menuItems?: React.ReactNode
  onLogout?: () => void
}

export const AvatarDropdown = forwardRef<HTMLButtonElement, AvatarDropdownProps>(
  function AvatarDropdown(
    {
      type,
      user,
      company,
      wms,
      mine = false,
      withName = true,
      size = 40,
      menuItems,
      onLogout,
    },
    ref
  ) {
    const { me, myCompany, myWms} = useContext(MeContext)
    
    let avatarNode: React.ReactNode = null
    if (type === "user") {
      avatarNode = (
        <UserAvatar
          ref={ref}
          user={user}
          mine={mine}
          withName={withName}
          size={size}
          variant="ghost"
        />
      )
    } else if (type === "wms") {
      avatarNode = (
        <WmsAvatar
          ref={ref}
          wms={wms}
          mine={mine}
          withName={withName}
          size={size}
          variant="ghost"
        />
      )
    } else if (type === "company") {
      avatarNode = (
        <CompanyAvatar
          ref={ref}
          wms={wms}
          mine={mine}
          withName={withName}
          size={size}
          variant="ghost"
        />
      )
    }

    let displayName = "Unnamed"
    if (type === "user" && (mine ? me : user)) {
      const theUser = mine ? me : user
      const first = theUser?.firstName
      ? theUser.firstName[0].toUpperCase() + theUser.firstName.slice(1)
      : ""
      const last = theUser?.lastName
      ? theUser.lastName[0].toUpperCase() + theUser.lastName.slice(1)
      : ""
      const displayName = (first + " " + last).trim() || "Unnamed User" 
    } else if (type === "company" && (mine ? myCompany :  company)) {
      const theCo = mine ? myCompany : company
      const name = theCo?.name
        ? theCo.name[0].toUpperCase() + theCo.name.slice(1)
        : ""
      const displayName = (name).trim() || "Unnamed Company"
    } else if (type === "wms" && (mine ? myWms : wms)) {
      const theWms = mine ? myWms : wms
      const name = theWms?.name
        ? theWms.name[0].toUpperCase() + theWms.name.slice(1)
        : ""
      const displayName = (name).trim() || "Unnamed Wms"
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            {avatarNode}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menuItems}

        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
