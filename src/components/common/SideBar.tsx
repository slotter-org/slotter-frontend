import React, { useContext, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  useSidebar, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter, 
  SidebarSeparator, 
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MeContext } from "@/contexts/MeProvider"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { CompanyAvatar, WmsAvatar } from "@/components/common/avatars/Avatar"
import { mainNav } from '@/types/navitem'
import { NavItems } from '@/components/common/NavItems'
import { AiChatToggleButton } from '@/components/common/buttons/AiChatToggleButton'

export function SideBar() {
  const { state } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const { me, myCompany, myWms } = useContext(MeContext)
  const avatarRef = useRef<HTMLButtonElement>(null)
  function focusAvatar() {
    avatarRef.current?.focus()
  }
  
  let avatar: React.ReactNode = null
  let displayName = ""
  if (me) {
    if (me?.userType === "wms" && myWms) {
      displayName = myWms?.name[0].toUpperCase() + myWms?.name.split(1)
    } else if (me?.userType === "company" && myCompany) {
      displayName = myCompany?.name[0].toUpperCase() + myCompany?.name.split(1)
    } else {
      displayName = "Unnamed Entity"
    }
  }
  
  if (state === "expanded") {
    if (me?.userType === "wms" && myWms) {
      avatar = <WmsAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm bg-sidebar-background" />
    } else if (me?.userType === "company" && myCompany) {
      avatar = <CompanyAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm bg-sidebar-background" />
    }
  } else {
    if (me?.userType === "wms" && myWms) {
      avatar = <WmsAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />
    } else if (me?.userType === "company" && myCompany) {
      avatar = <CompanyAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />
    }
  }

  const activeKey = useMemo(() => {
    const current = mainNav.find((item) => {
      if (!item.href) return false
      return location.pathname.startsWith(item.href)
    })
    return current?.key
  }, [location, mainNav])

  const onChangeActive = (key: string) => {
    const clicked = mainNav.find((item) => item.key === key)
    if (clicked?.href) {
      navigate(clicked.href)
    }
  }

  const [isOn, setIsOn] = React.useState(false)

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="relative flex flex-col h-full bg-background">

        <div className="flex items-center justify-center h-16">
          <SidebarHeader className="justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <div>
                  {avatar}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-48" sideOffset={8}>
                <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>
        </div>
        
        <div className="flex-1">
          {state === "expanded" ? (
            <NavItems
              items={mainNav}
              activeKey={activeKey}
              onChangeActive={onChangeActive}
              className="flex-col"
              displayMode="icon-and-label"
              labelPosition="right"
              bgPosition="center"
              contentPosition="start"
              barType="sidebar"
            />
          ) : (
            <NavItems
              items={mainNav}
              activeKey={activeKey}
              onChangeActive={onChangeActive}
              className="flex-col items-center justify-center"
              displayMode="icon-only"
              barType="sidebar"
            />
          )}
        </div>

        <SidebarSeparator />
        <SidebarFooter className="ml-1">
          <AiChatToggleButton />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
