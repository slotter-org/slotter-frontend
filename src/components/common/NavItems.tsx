import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavItem } from "@/types/navitem"

interface NavItemProps {
  items: NavItem[]
  activeKey?: string
  onChangeActive?: (key: string) => void
  className?: string
  displayMode?: "icon-only" | "label-only" | "icon-and-label"
  labelPosition?: "right" | "below"
  contentPosition?: "start" | "center" | "end"
  bgPosition?: "start" | "center" | "end"
  width?: number

  /**
   * "sidebar" or "bottombar" usage
   * - "sidebar": we keep margin, etc.
   * - "bottombar": we remove margin to prevent clipping & let items auto-size
   */
  barType?: "sidebar" | "bottombar"
}

export function NavItems({
  items,
  activeKey,
  onChangeActive,
  className,
  displayMode = "icon-only",
  labelPosition = "right",
  contentPosition = "center",
  bgPosition = "center",
  width = 0,
  barType = "sidebar",
}: NavItemProps) {
  return (
    // Make this nav a simple flex container,
    // let parent’s className control overall distribution (justify-*, etc.)
    <nav className={cn("flex w-full", className)}>
      {items.map((item) => {
        const isActive = item.key === activeKey
        const variant = isActive ? "secondary" : "ghost"

        const handleClick = () => {
          item.onClick?.()
          onChangeActive?.(item.key)
        }

        // If width > 0, we pass { hardWidth: width }
        const hardWidthProps = width > 0 ? { hardWidth: width } : {}

        // For the bottom bar, we remove the margin to avoid clipping.
        // For the sidebar, we keep the "m-2" (if you still want that).
        const buttonMarginClass = barType === "sidebar" ? "m-2" : ""

        return (
          <Button
            key={item.key}
            variant={variant}
            onClick={handleClick}
            bgAlignment={bgPosition}
            contentPosition={contentPosition}
            {...hardWidthProps}
            className={cn(
              // If in bottom bar, also do "h-full" so it fully fits the bar’s height
              barType === "bottombar" && "h-full rounded-md",
              buttonMarginClass
            )}
          >
            {/* ICON-ONLY */}
            {displayMode === "icon-only" && item.icon}

            {/* LABEL-ONLY */}
            {displayMode === "label-only" && item.label}

            {/* ICON + LABEL */}
            {displayMode === "icon-and-label" && (
              <>
                {labelPosition === "below" ? (
                  <div className="flex flex-col items-center text-xs gap-1">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ) : labelPosition === "right" ? (
                  <>
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </>
                ) : (
                  <>
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </>
                )}
              </>
            )}
          </Button>
        )
      })}
    </nav>
  )
}

