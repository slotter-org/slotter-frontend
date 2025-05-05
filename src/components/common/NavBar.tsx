import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useTheme } from "@/contexts/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { MeContext } from "@/contexts/MeProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/common/Logo";
import { UserAvatar, CompanyAvatar, WmsAvatar } from "@/components/common/avatars/Avatar";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { useViewport } from "@/contexts/ViewportProvider";
import { SearchBar } from "@/components/common/SearchBar";
import { mainNav } from "@/types/navitem";
import { NavItems } from "@/components/common/NavItems";
import { CompanyAvatarDropdown } from '@/components/common/dropdowns/CompanyAvatarDropdown';
import { WmsAvatarDropdown } from '@/components/common/dropdowns/WmsAvatarDropdown';

export function NavBar() {
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const hideAuthButtons = isLoginPage || isRegisterPage;


  if (!isAuthenticated) {
    return (
      <nav className="sticky top-0 z-50 h-16 flex items-center w-full justify-between border-b p-4 bg-background text-foreground">
        {/*Left: Logo*/}
        <div className="flex items-center">
          <Logo />
        </div>

        {/*Right: Auth Links?*/}
        <div className="flex items-center gap-2">
          {!hideAuthButtons && (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="ghost">Sign up</Button>
              </Link>
            </>
          )}
          <ThemeToggle iconSize={18} />
        </div>
      </nav>
    );
  }
  return <NavBarWithSidebar />;
}

function NavBarWithSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { me } = useContext(MeContext);
  const { isOffCanvas, state } = useSidebar();
  const { isBelowMd, isBelowLg } = useViewport();
  const avatarRef = useRef<HTMLButtonElement>(null)
  function focusAvatar() {
    avatarRef.current?.focus()
  }
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  let myAvatar: React.ReactNode = null;
  if (me) {
    if (!isOffCanvas) {
      if (state === "expanded") {
        myAvatar = <UserAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm"/>;
      } else {
        myAvatar = <UserAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24}/>;
      }
    } else {
      if (isBelowMd) {
        myAvatar = <UserAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />;
      } else {
        myAvatar = <UserAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm" />;
      }
    }
  }
  let entityAvatar: React.ReactNode = null;
  if (me) {
    if (isOffCanvas) {
      if (isBelowMd) {
        if (me.userType === "wms") {
          entityAvatar = <WmsAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />;
        } else if (me.userType === "company") {
          entityAvatar = <CompanyAvatar ref={avatarRef} mine withName={false} variant="ghost" size={24} />;
        }
      } else {
        if (me.userType === "wms") {
          entityAvatar = <WmsAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm" />;
        } else if (me.userType === "company") {
          entityAvatar = <CompanyAvatar ref={avatarRef} mine withName={true} variant="outline" size={20} className="shadow-sm"/>;
        }
      }
    }
  }
  let leftMost = "flex items-center justify-start"
  let centerMost = "flex items-center justify-center"
  let rightMost = "flex items-center justify-end"
  if (isOffCanvas) {
    if (isBelowMd) {
      leftMost = "flex items-center justify-start w-1/4"
      centerMost = "flex items-center justify-center w-2/4"
      rightMost = "flex items-center justify-end w-1/4 gap-2"
    } else {
      leftMost = "flex items-center justify-start w-1/2"
      centerMost = "flex items-center justify-center w-0"
      rightMost = "flex items-center justify-end w-1/2 gap-2"
    }
  } else if (state === "expanded") {
    leftMost = "flex items-center justify-start w-1/4"
    centerMost = "flex items-center justify-center w-0"
    rightMost = "flex items-center justify-end w-3/4 gap-2"
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
  
  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center w-full justify-between border-b px-2 bg-background text-foreground">
      {/*Left Side*/}
      <div className={`${leftMost}`}>
        {isOffCanvas ? (
          isBelowMd ? (
            me?.userType === 'company' ? (
              <CompanyAvatarDropdown
                trigger={entityAvatar}
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
                trigger={entityAvatar}
                onSelectCompany={(id) => {
                  console.log('Select Company Clicked')
                }}
                onSelectUser={(id) => {
                    console.log('Select User Clicked')
                }}
              />
            )
          ) : (
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                {me?.userType === 'company' ? (
                  <CompanyAvatarDropdown
                    trigger={entityAvatar}
                    onSelectWarehouse={(id) => {
                      console.log('Select Warehouse Clicked')                    
                    }}
                    onSelectUser={(id) => {
                      console.log('Select User Clicked')
                    }}
                  />
                ) : (
                  <WmsAvatarDropdown
                    trigger={entityAvatar}
                    onSelectCompany={(id) => {
                      console.log('Select Company Clicked')
                    }}
                    onSelectUser={(id) => {
                      console.log('Select User Clicked')
                    }}
                  />
                )}
              </div>
            </div>
          )
        ) : (
          <SidebarTrigger />
        )}
      </div>

      {/*Center*/}
      <div className={`${centerMost}`}>
        {isBelowMd && <SearchBar />}
      </div>

      {/*Right Side*/}
      <div className={`${rightMost} gap-2`}>
        {!isBelowMd &&<SearchBar />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              {myAvatar}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Profile</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

