import React from "react"
import { useAiChat } from "@/contexts/AiChatContext"
import { useSidebar } from "@/components/ui/sidebar"
import { useViewport } from "@/contexts/ViewportProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AiChatToggleButton() {
  const { isOpen, toggleChat } = useAiChat()
  const { isOffCanvas, state } = useSidebar()
  const { isBelowSm, isBelowMd } = useViewport()

  let labelShown = false
  let labelWhere: "right" | "below" = "right"

  // Decide label logic
  if (isOffCanvas) {
    // If in offcanvas mode, show label below only if between sm and md breakpoints
    if (!isBelowSm && isBelowMd) {
      labelShown = true
      labelWhere = "below"
    } else {
      labelShown = false
    }
  } else if (state === "expanded") {
    // If normal sidebar is expanded => label to the right
    labelShown = true
    labelWhere = "right"
  } else {
    // Collapsed => no label
    labelShown = false
  }

  // Compute classes for the overall Button layout
  // If no label => center the icon. If label is "right" => row, if "below" => column.
  const layoutClasses = labelShown
    ? labelWhere === "right"
      ? "flex-row items-center justify-start"
      : "flex-col items-center justify-center"
    : "justify-center" // no label => center icon

  return (
    <Button
      variant="ghost"
      onClick={toggleChat}
      // Combine our dynamic layout with baseline styling
      className={cn(
        "relative flex p-2", // baseline
        layoutClasses // dynamic layout
      )}
    >
      {/* The AI chat icon */}
      <img src="/ai-button.svg" alt="AI Chat Toggle" className="h-7 w-7" />

      {labelShown ? (
        labelWhere === "right" ? (
          // Label to the right
          <span className="ml-1 text-sm font-medium">
            {isOpen ? "Close Chat" : "Open Chat"}
          </span>
        ) : (
          // Label on bottom
          <div className="mt-1 flex flex-col items-center text-xs leading-tight">
            <span>{isOpen ? "Close" : "Open"}</span>
            <span>Chat</span>
          </div>
        )
      ) : (
        // No label => visually hidden text
        <span className="sr-only">
          {isOpen ? "Close Chat" : "Open Chat"}
        </span>
      )}
    </Button>
  )
}

