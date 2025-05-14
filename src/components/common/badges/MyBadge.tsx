import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyBadgeProps {
  icon?: React.ReactNode;
  title: string;
  color?: string;
  showCloseOnHover?: boolean;
  onClose?: () => void;
  className?: string;

  draggable?: boolean;
  dragData?: any;
  onDragStart?: (e: React.DragEvent) => void;
}

export function MyBadge({
  icon,
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

  const ghostRef = useRef<HTMLDivElement | null>(null);

  // Attempting a simple “hex + 20” opacity for background:
  const backgroundColor = `${color}20`; // e.g. #6366f120
  const borderColor = color;
  const textColor = color;

  const handleDragStart = (e: React.DragEvent) => {
    // Attach data
    if (dragData) {
      e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
    setIsDragging(true);

    // Create a ghost element for the drag preview
    const ghostElement = document.createElement("div");
    ghostElement.className =
      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold";
    ghostElement.style.backgroundColor = backgroundColor;
    ghostElement.style.borderColor = borderColor;
    ghostElement.style.color = textColor;
    ghostElement.style.padding = "2px 8px";
    ghostElement.style.opacity = "0.8";
    ghostElement.innerText = title;

    document.body.appendChild(ghostElement);
    ghostRef.current = ghostElement;

    // Set the custom drag image
    e.dataTransfer.setDragImage(ghostElement, 15, 15);

    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Clean up ghost element if it still exists
    if (ghostRef.current && document.body.contains(ghostRef.current)) {
      document.body.removeChild(ghostRef.current);
    }
    ghostRef.current = null;
  };

  const handleClickClose = (e: React.MouseEvent) => {
    // Stop the parent from seeing this as a drag or click
    e.stopPropagation();
    onClose?.();
  };

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
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      {icon && <span className="mr-1">{icon}</span>}
      <span>{title}</span>
      {showCloseOnHover && isHovered && (
        <X
          className="ml-1 h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
          onMouseDown={handleClickClose} // prevent drag
          onClick={handleClickClose}
        />
      )}
    </div>
  );
}
