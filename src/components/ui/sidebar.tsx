// src/components/ui/sidebar.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { useViewport } from "@/contexts/ViewportProvider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ---------------------------------------------------------------------------
// Removed the custom hooks and function that computed screen width locally.
// We now rely on useViewport() from ViewportProvider instead.

// ---------------------------------------------------------------------------
// "SidebarContextProps" tracks whether we are 'expanded' or 'collapsed' for desktop,
// plus a separate "openMobile" for off-canvas, etc.

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isBelowMd: boolean // < md
  isOffCanvas: boolean
  toggleSidebar: () => void
  toggleExpand: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Various constants
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "10rem"
const SIDEBAR_WIDTH_ICON = "4.6rem"

// The core <SidebarProvider> that tracks open/collapsed/offcanvas
export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(function SidebarProviderImpl(
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  // Get breakpoints from our ViewportProvider
  const { isBelowMd, isBelowLg } = useViewport()

  // open => "expanded" (true) vs "collapsed" (false) for "desktop".
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen
  const setOpen = React.useCallback(
    (value: boolean | ((old: boolean) => boolean)) => {
      const newVal = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(newVal)
      } else {
        setInternalOpen(newVal)
      }
      // Store in cookie just in case
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newVal}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [open, setOpenProp]
  )

  // openMobile => whether the sidebar is forced off-canvas
  const [openMobile, setOpenMobile] = React.useState(false)

  // If user manually toggled expanded<->collapsed, we won't auto-set from breakpoints:
  const [manualToggled, setManualToggled] = React.useState<boolean | null>(null)

  // On mount / whenever breakpoints change:
  //   - If < md => the sidebar is not rendered at all
  //   - If [md, lg) => default to collapsed (icon) if user hasn't toggled
  //   - If ≥ lg => default to expanded if user hasn't toggled
  React.useEffect(() => {
    if (isBelowMd) {
      // < md => do nothing; the sidebar isn't displayed
      return
    }
    if (manualToggled === null && !isBelowLg) {
      setOpen(true)
    }
    // If they've manually toggled at any point, don't override
    if (manualToggled !== null && !isBelowLg) {
      return
    }
    if (!isBelowMd) {
      setManualToggled(null)
    }
    if (!isBelowLg) {
      setManualToggled(null)
    }
    if (isBelowLg) {
      // [md, lg)
      setOpen(false) // collapsed => icon
    } else {
      // >= lg
      setOpen(true) // expanded
    }
  }, [isBelowMd, isBelowLg, manualToggled, setOpen])

  // NavBar button => toggles on/off-canvas (for ANY width ≥ md).
  const toggleSidebar = React.useCallback(() => {
    if (isBelowMd) {
      // < md => no sidebar
      return
    }
    // If we were on-canvas, go off-canvas; if off, bring it back on
    setOpenMobile((prev) => !prev)
  }, [isBelowMd])

  // Chevron arrow => toggles expanded <-> collapsed (if not offcanvas).
  const toggleExpand = React.useCallback(() => {
    if (isBelowMd) {
      return
    }
    setManualToggled(true)
    setOpen((old) => !old)
  }, [isBelowMd, setOpen])

  // The state is either "expanded" or "collapsed" for desktop usage
  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed"
  const isOffCanvas = isBelowMd || openMobile

  const contextValue: SidebarContextProps = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isBelowMd,
      isOffCanvas,
      toggleSidebar,
      toggleExpand,
    }),
    [
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isBelowMd,
      isOffCanvas,
      toggleSidebar,
      toggleExpand,
    ]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-screen w-full",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})

// ---------------------------------------------------------------------------
// The actual <Sidebar> component. For < md => returns null.
// For ≥ md => can be either icon, expanded, or offcanvas.

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(function SidebarImpl(
  {
    side = "left",
    variant = "sidebar",
    collapsible = "icon", // you can keep default "icon"
    className,
    children,
    ...props
  },
  ref
) {
  const {
    isBelowMd,
    open,
    openMobile,
    state,
  } = useSidebar()

  // If < md => do not render any sidebar at all
  if (isBelowMd) {
    return null
  }

  // [md, lg): if openMobile => offcanvas, else collapsed to icon
  // ≥ lg: if openMobile => offcanvas, else expanded or icon based on `open`
  const showOffcanvas = openMobile

  // Our final data-state => expanded or collapsed
  const sidebarState = open ? "expanded" : "collapsed"

  // data-collapsible => "offcanvas" if offcanvas, else "icon" if collapsed, else ""
  let collapsibleValue = ""
  if (showOffcanvas) {
    collapsibleValue = "offcanvas"
  } else if (!open) {
    collapsibleValue = "icon"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group peer hidden text-sidebar-foreground md:block",
        className
      )}
      data-state={sidebarState}
      data-collapsible={collapsibleValue}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      {/* Invisible spacer so main content doesn't shift on collapse */}
      <div
        className={cn(
          "relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
        )}
      />
      {/* Actual sidebar panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-screen w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l"
        )}
      >
        <div
          data-sidebar="sidebar"
          className={cn(
            "flex h-full w-full flex-col bg-sidebar",
            "group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          )}
        >
          {children}
          {/* Chevron arrow toggler: only shows if ≥ lg and not offcanvas */}
          <ArrowToggleIfLg side={side} offcanvas={showOffcanvas} />
        </div>
      </div>
    </div>
  )
})

/**
 * Renders a floating arrow on the sidebar edge for ≥ lg if not offcanvas.
 * If collapsed => arrow indicates “expand.” If expanded => arrow indicates “collapse.”
 */
function ArrowToggleIfLg({
  side,
  offcanvas,
}: {
  side: "left" | "right"
  offcanvas: boolean
}) {
  const { toggleExpand, open } = useSidebar()
  const { isBelowLg } = useViewport() // use the viewport to check if < lg
  // Hide if < lg or if offcanvas
  if (isBelowLg || offcanvas) return null

  const isExpanded = open
  const isLeft = side === "left"
  const ArrowIcon = isExpanded
    ? isLeft
      ? ChevronLeft
      : ChevronRight
    : isLeft
    ? ChevronRight
    : ChevronLeft

  return (
    <button
      onClick={toggleExpand}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full p-1 bg-sidebar-accent opacity-75 shadow-md hover:opacity-100",
        side === "right" && "rotate-180"
      )}
      style={{
        [side === "left" ? "right" : "left"]: 0,
      }}
    >
      <ArrowIcon className="h-5 w-5" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// The rest are standard sidebar subcomponents

export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Toggle>,
  React.ComponentPropsWithoutRef<typeof Toggle>
>(function SidebarTriggerImpl({ className, onClick, ...props }, ref) {
  const { openMobile, toggleSidebar } = useSidebar()
  const pressed = !openMobile
  return (
    <Toggle
      ref={ref}
      pressed={pressed}
      onPressedChange={() => toggleSidebar()}
      className={cn("", className)}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Toggle>
  )
})

export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(function SidebarRailImpl({ className, ...props }, ref) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(function SidebarInsetImpl({ className, ...props }, ref) {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow"
      )}
      {...props}
    />
  )
})

export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(function SidebarInputImpl({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarHeaderImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarFooterImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(function SidebarSeparatorImpl({ className, ...props }, ref) {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarContentImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarGroupImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(function SidebarGroupLabelImpl({ className, asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(function SidebarGroupActionImpl(
  { className, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarGroupContentImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
})

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(function SidebarMenuImpl({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
})

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(function SidebarMenuItemImpl({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
})

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(function SidebarMenuButtonImpl(
  {
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "button"
  const { isBelowMd, open } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  let tooltipProps: React.ComponentProps<typeof TooltipContent>
  if (typeof tooltip === "string") {
    tooltipProps = { children: tooltip }
  } else {
    tooltipProps = tooltip
  }

  // Show the tooltip only if collapsed to icon (open=false) and ≥ md
  const hideTooltip = open || isBelowMd

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      {!hideTooltip && (
        <TooltipContent side="right" align="center" {...tooltipProps} />
      )}
    </Tooltip>
  )
})

export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(function SidebarMenuActionImpl(
  { className, asChild = false, showOnHover = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})

export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarMenuBadgeImpl({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})

export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(function SidebarMenuSkeletonImpl({ className, showIcon = false, ...props }, ref) {
  // Random width for skeleton
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})

export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(function SidebarMenuSubImpl({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(function SidebarMenuSubItemImpl(props, ref) {
  return <li ref={ref} {...props} />
})

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(function SidebarMenuSubButtonImpl(
  { asChild = false, size = "md", isActive, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "a"
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})

