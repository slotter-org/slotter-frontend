import React, { useContext, forwardRef } from 'react'
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"
import type { Company } from "@/types/company"
import type { Wms } from "@types/wms"
import { MeContext } from "@/contexts/MeProvider"
import { MyWmsContext} from "@/contexts/MyWmsProvider"
import { MyCompanyContext} from "@/contexts/MyCompanyProvider"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"

interface BaseAvatarProps {
  size?: number
  className?: string
  variant?: "outline", "ghost"
  withName?: boolean
  mine?: boolean
}

interface UserAvatarProps extends BaseAvatarProps {
  user?: User | null
}

export const UserAvatar = forwardRef<HTMLButtonElement, UserAvatarProps>(
  function UserAvatar(
    {
      user,
      size = 40,
      className,
      variant = "outline",
      withName = true,
      mine = false,
    },
    ref
  ) {
    const fallback = ""
    const { me } = useContext(MeContext)
    const effectiveUser = mine ? me : user
    const src = effectiveUser?.avatarURL || fallback
    const first = effectiveUser?.firstName
      ? effectiveUser.firstName[0].toUpperCase() + effectiveUser.firstName.slice(1)
      : ""
    const last = effectiveUser?.lastName
      ? effectiveUser.lastName[0].toUpperCase() + effectiveUser.lastName.slice(1)
      : ""
    const displayName = (first + " " + last).trim() || "Unnamed User"

    if (withName) {
      return (
        <Button variant={`${variant}`} className={cn("flex items-center gap-2 text-sm font-semibold", className)} ref={ref}>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <img
                src={src}
                alt={`${displayName}'s avatar`}
                style={{ width: size, height: size, objectFit: "cover" }}
              />
              <span>{displayName}</span>
            </div>
            <ChevronsUpDown className="text-muted-foreground" />
          </div>
        </Button>
      )
    } else {
      return (
        <Button variant={`${variant}`} className={cn("flex-shrink-o overflow-visible items-center", className)} ref={ref}>
          <img
            src={src}
            alt={`${displayName}'s avatar`}
            style={{ width: size, height: size, objectFit: "cover" }}
          />
        </Button>
      )
    }
  }
)


interface CompanyAvatarProps extends BaseAvatarProps {
  company?: Company | null
}

export const CompanyAvatar = forwardRef<HTMLButtonElement, CompanyAvatarProps>(
  function CompanyAvatar(
    {
      company,
      size = 40,
      className,
      variant = "outline",
      withName = true,
      mine = false,
    },
    ref
  ) {
    const fallback = ""
    const { myCompany } = useContext(MyCompanyContext)
    const effectiveCompany = mine ? myCompany : company
    const src = effectiveCompany?.avatarURL || fallback
    const name = effectiveCompany?.name
      ? effectiveCompany.name[0].toUpperCase() + effectiveCompany.name.slice(1)
      : ""
    const displayName = (name).trim() || "Unnamed Company"

    if (withName) {
      return (
        <Button variant={`${variant}`} className={cn("flex items-center text-sm font-semibold", className)} ref={ref}>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <img
                src={src}
                alt={`${displayName} avatar`}
                style={{ width: size, height: size, objectFit: "cover" }}
              />
              <span>{displayName}</span>
            </div>
            <ChevronsUpDown className="text-muted-foreground" />
          </div>
        </Button>
      )
    } else {
      return (
        <Button variant={`${variant}`} className={cn("items-center", className)} ref={ref}>
          <img
            src={src}
            alt={`${displayName} avatar`}
            style={{ width: size, height: size, objectFit: "cover" }}
          />
        </Button>
      )
    }
  }
)


interface WmsAvatarProps extends BaseAvatarProps {
  wms?: Wms | null
}

export const WmsAvatar = forwardRef<HTMLButtonElement, WmsAvatarProps>(
  function WmsAvatar(
    {
      wms,
      size = 40,
      className,
      variant = "outline",
      withName = true,
      mine = false,
    },
    ref
  ) {
    const fallback = ""
    const { myWms } = useContext(MyWmsContext)
    const effectiveWms = mine ? myWms : wms
    const src = effectiveWms?.avatarURL || fallback
    const name = effectiveWms?.name
      ? effectiveWms.name[0].toUpperCase() + effectiveWms.name.slice(1)
      : ""
    const displayName = (name).trim() || "Unnamed Wms"

    if (withName) {
      return (
        <Button variant={`${variant}`} className={cn("flex items-center gap-2 text-sm font-semibold", className)} ref={ref}>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <img
                src={src}
                alt={`${displayName} avatar`}
                style={{ width: size, height: size, objectFit: "cover" }}
              />
              <span>{displayName}</span>
            </div>
            <ChevronsUpDown className="text-muted-foreground" />
          </div>
        </Button>
      )
    } else {
      return (
        <Button variant={`${variant}`} className={cn("items-center", className)} ref={ref}>
          <img
            src={src}
            alt={`${displayName} avatar`}
            style={{ width: size, height: size, objectFit: "cover" }}
          />
        </Button>
      )
    }
  }
)



