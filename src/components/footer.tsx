"use client"

import { Github, Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">UIU Section Selector</h3>
            <p className="text-sm text-muted-foreground">
              A smart university course scheduling app that helps students plan their 
              academic schedules with advanced conflict detection and faculty preferences.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for students</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• PDF Course Data Import</li>
              <li>• Smart Schedule Generation</li>
              <li>• Faculty Preference Matching</li>
              <li>• Time Conflict Detection</li>
              <li>• Multiple View Modes</li>
              <li>• Dark/Light Theme Support</li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a
                  href="https://github.com/TahsinFaiyaz30/UIU-Section-Selector"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Github className="h-4 w-4" />
                  <span>View Source Code</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a
                  href="https://github.com/TahsinFaiyaz30/UIU-Section-Selector/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <span>🐛</span>
                  <span>Report Issues</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a
                  href="https://github.com/TahsinFaiyaz30/UIU-Section-Selector/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <span>💬</span>
                  <span>Discussions</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} UIU Section Selector. Built with Next.js & Tailwind CSS.
            </div>
            <div className="text-sm text-muted-foreground">
              Designed for <span className="font-medium">UIU Students</span> and beyond.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
