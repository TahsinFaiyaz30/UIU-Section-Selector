"use client"

import { Github, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold truncate">UIU Section Selector</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Smart course scheduling for university students
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1.5 sm:space-x-4 flex-shrink-0">
            {/* GitHub Button */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <a
                href="https://github.com/TahsinFaiyaz30/UIU-Section-Selector"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>

            {/* Mobile GitHub Button */}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="sm:hidden h-8 w-8"
            >
              <a
                href="https://github.com/TahsinFaiyaz30/UIU-Section-Selector"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
