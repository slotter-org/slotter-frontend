import React from "react"
import { useTheme } from "@/contexts/ThemeProvider"
import { Link, useLocation } from "react-router-dom"

export function Logo({ variant = "icon", className }: LogoProps) {
  const { theme } = useTheme()

  const lightIcon = "/logo-icon-light.svg"
  const darkIcon = "/logo-icon-dark.svg"

  const lightFull = "/logo-light-full-icon.svg"
  const darkFull = "/logo-dark-full-icon.svg"

  const isSystemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
  const effectiveTheme = theme === "system" ? (isSystemDark ? "dark" : "light") : theme
  
  const extendedLogo =
    effectiveTheme === "dark"
      ? darkFull
      : lightFull
  const smallLogo =
    effectiveTheme === "dark"
      ? darkIcon
      : lightIcon

  return (
    <>
      <Link to="/">
        <img src={extendedLogo} alt="Slotter logo" className="hidden h-24 w-auto lg:block" />
        <img src={smallLogo} alt="Slotter logo" className="block h-10 w-auto lg:hidden" />
      </Link>
    </>
  )
}
