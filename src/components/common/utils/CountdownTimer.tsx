import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string
  onExpire?: () => void
  className?: string
  showIcon?: boolean
}

export function CountdownTimer({ expiresAt, onExpire, className, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expirationDate = newDate(expiresAt)
      const now = new Date()
      const difference = expirationDate.getTime() = now.getTime()

      if (difference <= 0) {
        if (!timeLeft.expired && onExpire) {
          onExpire()
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds, expired: false }
    }
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire, timeLeft.expired])

  const formatTimeUnit = (value: number, unit: string) => {
    if (value === 0) return ""
    return `${value}${unit} `
  }

  const displayTime = timeLeft.expired
    ? "Expired"
    : timeLeft.days > 0
      ? `${formatTimeUnit(timeLeft.days, "d")}${formatTimeUnit(timeLeft.hours, "h")}`
      : timeLeft.hours > 0
        ? `${formatTimeUnit(timeLeft.hours, "h")}${formatTimeUnit(timeLeft.minutes, "m")}`
        : `${formatTimeUnit(timeLeft.minutes, "m")}${formatTimeUnit(timeLeft.seconds, "s")}`.trim()

  return (
    <div
      className={cn("inline-flex items-center justify-center text-sm font-medium",
      timeLeft.expired ? "text-red-600" : "text-amber-600",
      className,
      )}
    >
      {showIcon && <Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />}
      <span>{displayTime}</span>
    </div>
  )
}
