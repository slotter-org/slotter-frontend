import React, { useState, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useViewport } from '@/contexts/ViewportProvider'
import { mainNav } from '@/types/navitem'
import { NavItems } from '@/components/common/NavItems'

export function BottomBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isBelowSm } = useViewport()
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
    <nav className="bg-background flex sticky bottom-0 z-50 h-16 border-t text-sidebar-foreground w-full items-center justify-center">
      <div className="w-full flex items-center justify-center">
        {isBelowSm ? (
            <NavItems
              items={mainNav}
              activeKey={activeKey}
              onChangeActive={onChangeActive}
              className="h-full flex-1"
              displayMode="icon-only"
              barType="bottombar"
            />
        ) : (
          <NavItems
            items={mainNav}
            activeKey={activeKey}
            onChangeActive={onChangeActive}
            className="h-full flex-1"
            displayMode="icon-and-label"
            labelPosition="below"
            barType="bottombar"
          />
        )}
      </div>
    </nav>
  )
}
