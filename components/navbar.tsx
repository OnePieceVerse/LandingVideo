"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Camera className="h-6 w-6" />
                <span className="font-bold">LandingVideo</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <nav className="flex items-center space-x-2">
                <Button
                  variant={pathname === "/" ? "default" : "ghost"}
                  asChild
                >
                  <Link href="/">
                    Home
                  </Link>
                </Button>
                <Button
                  variant={pathname === "/profile" ? "default" : "ghost"}
                  asChild
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}