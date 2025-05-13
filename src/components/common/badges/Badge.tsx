import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  icon?: React.ReactNode
  title: string
  color?: string
  showCloseOnHover?: boolean
  onClose?: () => void
  className?: string
}

export function Badge({
  icon,
  title,
  color = "default",
  showCloseOnHover = false,
  onClose,
  className,
}: BadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const backgroundColor = `${color}20`
  const borderColor = color
  const textColor = color

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition-all",
        className,
      )}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      <span>{title}</span>
      {showCloseOnHover && isHovered && (
        <X
          className="ml-1 h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        />
      )}
    </div>
  )
}
