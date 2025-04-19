import * as React from "react"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

interface GradientToggleProps extends Omit<React.ComponentPropsWithoutRef<typeof Toggle>, "pressed" | "onPressedChange"> {
  onToggle?: (pressed: boolean) => void;
}

export function GradientToggleButton({
  onToggle,
  className,
  ...props
}: GradientToggleProps) {
  const [pressed, setPressed] = React.useState(false)
  const handlePressedChange = (nextPressed: boolean) => {
    setPressed(nextPressed)
    onToggle?.(nextPressed)
  }
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={handlePressedChange}
      className={cn(
        "bg-gradient-to-tl from-blue-500 to green-500 text-white",
        "w-8 h-8 rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-colors hover:opacity-90 active:opacity-80",
        className
      )}
      {...props}
    />
  )
}
