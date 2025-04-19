import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      /**
       * This controls alignment of content *within* the button.
       * (icon + label pinned left/center/right inside the button)
       */
      contentPosition: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
      /**
       * This controls the button's placement in its parent container:
       * (the entire background pinned left/center/right).
       */
      bgAlignment: {
        start: "mr-auto",
        center: "mx-auto",
        end: "ml-auto",
      },
    },
    /**
     * Default variants
     */
    defaultVariants: {
      variant: "default",
      size: "default",
      contentPosition: "center",
      bgAlignment: "start", // Or center if you prefer. 
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Force a specific button width (e.g. "200px" or 300).
   * If not provided, the width is determined by normal sizing or the container.
   */
  hardWidth?: string | number
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      contentPosition,
      bgAlignment,
      asChild = false,
      hardWidth,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    // If user sets hardWidth, we apply it inline
    const style = React.useMemo(() => {
      if (!hardWidth) return undefined
      if (typeof hardWidth === "number") {
        return { width: `${hardWidth}px` }
      }
      return { width: hardWidth }
    }, [hardWidth])

    return (
      <Comp
        ref={ref}
        style={style}
        className={cn(
          buttonVariants({
            variant,
            size,
            contentPosition,
            bgAlignment,
            className,
          })
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

