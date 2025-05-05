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
import { useMyWms } from "@/contexts/MyWmsProvider"
import { useMyCompany } from "@/contexts/MyCompanyProvider"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { CompanyAvatar, WmsAvatar } from "@/components/common/avatars/Avatar"
import { mainNav } from '@/types/navitem'
import { NavItems } from '@/components/common/NavItems'
import { AiChatToggleButton } from '@/components/common/buttons/AiChatToggleButton'
import { CompanyAvatarDropdown } from '@/components/common/dropdowns/CompanyAvatarDropdown'
import { WmsAvatarDropdown } from '@/components/common/dropdowns/WmsAvatarDropdown'

export function SideBar() {
  const { state } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const { me } = useContext(MeContext)
  const { myWms } = useMyWms();
  const { myCompany } = useMyCompany();
  const avatarRef = useRef<HTMLButtonElement>(null)
  function focusAvatar() {
    avatarRef.current?.focus()
  }
  const myEntity = me?.userType === 'wms' ? myWms : me?.userType === 'company' ? myCompany : null;

  
  let avatar: React.ReactNode = null
  let displayName = ""
  if (me) {
    if (me?.userType === "wms") {
      displayName = myEntity?.name[0].toUpperCase() + myEntity?.name.split(1)
    } else if (me?.userType === "company") {
      displayName = myEntity?.name[0].toUpperCase() + myEntity?.name.split(1)
    } else {
      displayName = "Unnamed Entity"
    }
  }
  
  if (state === "expanded") {
    if (me?.userType === "wms") {
      avatar = <WmsAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm bg-sidebar-background" />
    } else if (me?.userType === "company") {
      avatar = <CompanyAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm bg-sidebar-background" />
    }
  } else {
    if (me?.userType === "wms") {
      avatar = <WmsAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />
    } else if (me?.userType === "company") {
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
            {me?.userType === 'company' ? (
              <CompanyAvatarDropdown
                trigger={avatar}
                onAddWarehouse={() => {
                  console.log('Add Warehouse Clicked')
                }}
                onSelectWarehouse={(id) => {
                  console.log('Select Warehouse Clicked')
                }}
                onSelectUser={(id) => {
                  console.log('Select User Clicked')
                }}
              />
            ) : (
              <WmsAvatarDropdown
                trigger={avatar}
                onSelectCompany={(id) => {
                  console.log('Select Company Clicked')
                }}
                onSelectUser{(id) => {
                  console.log('Select User Clicked')
                }}
              />
            )}
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
