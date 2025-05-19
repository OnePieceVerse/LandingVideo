"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Camera, User, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check authentication status when component mounts
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      router.push('/login')
    }
    // If logged in, the Link will work normally and navigate to /profile
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Video className="h-6 w-6" />
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
                  variant={pathname === "/generate" ? "default" : "ghost"}
                  asChild
                >
                  <Link href="/generate">
                    Generate
                  </Link>
                </Button>
                <Button
                  variant={pathname === "/profile" ? "default" : "ghost"}
                  asChild
                >
                  <Link href="/profile" onClick={handleProfileClick}>
                    <User className={`${isLoggedIn ? 'text-green-500 ' : ''}mr-2 h-4 w-4`} />
                    Profile {isLoggedIn ? '✓' : ''}
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
