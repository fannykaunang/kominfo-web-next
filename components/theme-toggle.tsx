"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder button with same size to prevent layout shift
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-transform rotate-0 scale-100" />
      ) : (
        <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-transform rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}