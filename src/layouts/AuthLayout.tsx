import React,  { useContext, useState, useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from '@/contexts/ThemeProvider';

interface AuthLayoutProps {
  children: ReactNode
  ghostButton?: ReactNode
  logoSrc?: string
  className?: string
}

export function AuthLayout({
  children,
  ghostButton,
  logoSrc = "/logo.svg",
  className,
}: AuthLayoutProps) {
  const { theme } = useTheme();
  const [isSystemDark, setIsSystemDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveTheme =
    theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;

  const backgroundColorLeft =
    effectiveTheme === 'dark'
      ? 'secondary'
      : 'foreground'
  const backgroundColorRight =
    effectiveTheme === 'dark'
      ? 'background'
      : 'background'

  const bgClassMap: Record<string, string> = {
    background: "bg-background",
    foreground: "bg-foreground",
    secondary: "bg-secondary",
  };

  const leftSideBgClass = bgClassMap[backgroundColorLeft] || "bg-background";
  const rightSideBgClass = bgClassMap[backgroundColorRight] || "bg-background";

  return (
    <div className={cn("flex h-screen w-screen flex-col md:flex-row", className)}>

      {/*Left Side*/}
      <div className={cn("relative hidden w-full flex-col px-6 py-4 md:flex md:w-1/2", leftSideBgClass)}>
        {/*Logo*/}
        <img src={logoSrc} alt="Slotter logo" className="h-8 w-auto" />
      </div>

      {/*Right Side*/}
      <div className={cn("relative flex w-full flex-col items-center justify-center bg-background px-8 py-10 md:w-1/2", rightSideBgClass)}>
        {/*Smaller Logo Mobile*/}
        <div className="absolute left-4 top-4 md:hidden">
          <img src={logoSrc} alt="Slotter logo" className="h-6 w-auto" />
        </div>
        {/*Ghost Button Top-Right*/}
        <div className="absolute right-4 top-4">
          {ghostButton}
        </div>
        {/* The Card Content, With A Simple Fade/Zoom Animation*/}
        <div className="w-full max-w-sm animate-in fade-in-50 zoom-in-75 duration-300">
          {children}
        </div>
      </div>
    </div>
  )
}
