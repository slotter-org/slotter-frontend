import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyBadgeProps {
  icon?: React.ReactNode;
  img?: string;
  title: string;
  color?: string;
  showCloseOnHover?: boolean;
  onClose?: () => void;
  className?: string;
  draggable?: boolean;
  dragData?: Record<string, any>;
  onDragStart?: () => void;
}

export function MyBadge({
  icon,
  img,
  title,
  color = "#6366f1",
  showCloseOnHover = false,
  onClose,
  className,
  draggable = false,
  dragData,
  onDragStart,
}: MyBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 20% alpha color from a 6-digit hex:
  const backgroundColor = `${color}20`;
  const borderColor = color;
  const textColor = color;

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return
    if (dragData) {
      const dataString = JSON.stringify(dragData)
      e.dataTransfer.setData("text/plain", dataString)
      console.log("Drag started with data:", dataString)
    }
    const ghostElement = document.createElement("div");
    ghostElement.textContent = title;
    ghostElement.className = "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold";
    ghostElement.style.backgroundColor = backgroundColor;
    ghostElement.borderColor = borderColor;
    ghostElement.color = textColor;
    ghostElement.padding = "2px 8px";
    ghostElement.style.opacity = "0.8";
    document.body.appendChild(ghostElement)
    e.dataTransfer.setDragImage(ghostElement, 0, 0)
    setIsDragging(true)
    onDragStart?.()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition-all",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
        className
      )}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/*{icon && <span className="mr-1">{icon}</span>}*/}
      {icon && !img && <span className="mr-1">{icon}</span>}
      {img && !icon && (
        <Avatar className="h-4 w-4 mr-1">
          <AvatarImage src={img} alt={title} />
          <AvatarFallback>{imgFallback || title.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <span>{title}</span>
      {showCloseOnHover && isHovered && onClose && (
        <X
          className="ml-1 h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
          onMouseDown={(e) => {
            e.stopPropagation()
            onClose()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />
      )}
    </div>
  );
}
