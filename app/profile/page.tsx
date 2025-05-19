"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

const videos = [
  {
    id: 1,
    title: "CFM strategy xxx",
    date: new Date(),
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000"
  },
  {
    id: 2,
    title: "CFM strategy yyy",
    date: new Date(),
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000"
  },
  {
    id: 3,
    title: "CFM strategy zzz",
    date: new Date(),
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1000"
  }
]

const images = [
  {
    id: 1,
    title: "Product Image 1",
    date: new Date(),
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000"
  },
  {
    id: 2,
    title: "Product Image 2",
    date: new Date(),
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000"
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true)
        
        // Check if user is logged in with Supabase
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Redirect to login page if not logged in
          router.push("/login")
          return
        }
        
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [router])
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    )
  }
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </div>
            
            {user && (
              <div className="mb-8 p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user.email ? user.email[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <h2 className="font-medium">{user.email || user.id}</h2>
                    <p className="text-sm text-muted-foreground">Joined via {user.app_metadata?.provider || 'Supabase'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Works</h2>
                <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => (
                    <div key={video.id} className="space-y-3">
                      <div className="overflow-hidden rounded-md">
                        <div className="aspect-video relative group cursor-pointer">
                          <img
                            alt={video.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            src={video.thumbnail}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                              ▶
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium leading-none">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(video.date, "yyyy-MM-dd HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">My Assets</h2>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="likes">Likes</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {videos.map((video) => (
                        <div key={video.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <img
                                alt={video.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                src={video.thumbnail}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                                  ▶
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(video.date, "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                      {images.map((image) => (
                        <div key={image.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <img
                                alt={image.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                src={image.thumbnail}
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">{image.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(image.date, "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="likes">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {videos.slice(0, 2).map((video) => (
                        <div key={video.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <img
                                alt={video.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                src={video.thumbnail}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                                  ▶
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(video.date, "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="images">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {images.map((image) => (
                        <div key={image.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <img
                                alt={image.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                src={image.thumbnail}
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">{image.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(image.date, "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="videos">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {videos.map((video) => (
                        <div key={video.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <img
                                alt={video.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                src={video.thumbnail}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                                  ▶
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(video.date, "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}