"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function GeneratePage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<{type: 'image' | 'video', url: string} | null>(null)
  const [paragraphs, setParagraphs] = useState<Array<{id: number, content: string, assets: Array<{type: 'image' | 'video' | 'gif', url: string}>}>>([
    {
      id: 1,
      content: "",
      assets: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000' },
        { type: 'video', url: 'https://static.videezy.com/system/resources/previews/000/005/529/original/Reaviling_Sjusj%C3%B8en_Ski_Senter.mp4' },
        { type: 'gif', url: 'https://media.giphy.com/media/3o7aCQ15bV5yZJN0GQ/giphy.gif' }
      ]
    },
    {
      id: 2,
      content: "",
      assets: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000' },
        { type: 'video', url: 'https://static.videezy.com/system/resources/previews/000/002/231/original/5226496.mp4' }
      ]
    },
    {
      id: 3,
      content: "",
      assets: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000' }
      ]
    }
  ])

  // Create refs for file inputs
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null])

  const handleCrawl = async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login page if not logged in
      router.push('/login')
      return
    }

    // Validate URL
    if (!url.trim()) {
      setLogs(["Error: Please enter a valid URL"])
      return
    }

    // Proceed with crawling if logged in
    setLoading(true)
    setLogs(["Crawling landing page content..."])

    try {
      // Make API call to third-party backend service
      const response = await fetch('https://api.landingvideo.com/v1/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LANDINGVIDEO_API_KEY || ''}`, // Using environment variable for API key - add to .env.local
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Update logs with response from backend
      setLogs(prev => [...prev,
        "Crawl successful",
        "Generating scene content..."
      ])

      // If the API returns paragraph content, update the paragraphs state
      if (data.paragraphs) {
        setParagraphs(data.paragraphs)
      }
    } catch (error) {
      console.error('Crawl error:', error)
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Failed to crawl URL'}`])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    setLoading(true)
    setLogs(prev => [...prev, "generating video...", "video generated successfully: https://example.com/video.mp4"])
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const updateParagraph = (id: number, content: string) => {
    setParagraphs(prev => prev.map(p => p.id === id ? { ...p, content } : p))
  }

  const handleFileUpload = (sceneId: number, fileType: 'image' | 'video', file: File) => {
    // In a real app, you would upload the file to a server and get a URL back
    // For this demo, we'll create a local object URL
    const url = URL.createObjectURL(file)

    setParagraphs(prev => prev.map(p => {
      if (p.id === sceneId) {
        return {
          ...p,
          assets: [...p.assets, { type: fileType, url }]
        }
      }
      return p
    }))

    // Add a log message
    setLogs(prev => [...prev, `${fileType} uploaded for scene ${sceneId}: ${file.name}`])
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6">
              <div className="space-y-8">
                {/* Step 1: Landing Page URL */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold">1</div>
                    <h2 className="text-xl font-semibold">Step 1: Crawl Landing Page Content</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/landingpage"
                      className="flex-1"
                    />
                    <Button onClick={handleCrawl} disabled={loading}>
                      {loading ? "Crawling..." : "Crawl"}
                    </Button>
                  </div>
                </div>

                {/* Step 2: Landing Page Content */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold">2</div>
                    <h2 className="text-xl font-semibold">Step 2: Edit Landing Page Content</h2>
                  </div>
                  <div className="space-y-6">
                    {paragraphs.map((paragraph) => (
                      <div key={paragraph.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-b">
                          <h3 className="font-medium">Scene {paragraph.id}</h3>
                          <div className="flex space-x-2">
                            {/* Video icon button removed */}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-1/2">
                            <div className="mb-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Script</h4>
                            </div>
                            <Textarea
                              placeholder={`scene ${paragraph.id} scripts.....`}
                              value={paragraph.content}
                              onChange={(e) => updateParagraph(paragraph.id, e.target.value)}
                              className="min-h-[120px] resize-none"
                            />
                          </div>
                          <div className="w-full md:w-1/2">
                            <div className="mb-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Assets</h4>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1">
                              {paragraph.assets.length > 0 ? (
                                paragraph.assets.map((asset, index) => (
                                  <div
                                    key={index}
                                    className="aspect-square bg-muted rounded-md overflow-hidden relative group cursor-pointer"
                                    onClick={() => setPreviewAsset(asset)}
                                  >
                                    {asset.type === 'image' ? (
                                      <img src={asset.url} alt={`Scene ${paragraph.id} asset ${index}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <video src={asset.url} className="w-full h-full object-cover" />
                                    )}
                                    <div
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening preview when clicking delete
                                        setParagraphs(prev => prev.map(p => {
                                          if (p.id === paragraph.id) {
                                            return {
                                              ...p,
                                              assets: p.assets.filter((_, i) => i !== index)
                                            }
                                          }
                                          return p
                                        }));
                                      }}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                          <path d="M18 6 6 18"></path>
                                          <path d="m6 6 12 12"></path>
                                        </svg>
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="aspect-square bg-muted rounded-md flex items-center justify-center col-span-full">
                                  <p className="text-sm text-muted-foreground">No assets yet. Click the button below to add.</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                ref={el => fileInputRefs.current[paragraph.id - 1] = el}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                                    handleFileUpload(paragraph.id, fileType, file);
                                    e.target.value = ''; // Reset the input
                                  }
                                }}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-1"
                                onClick={() => fileInputRefs.current[paragraph.id - 1]?.click()}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                                  <line x1="16" x2="22" y1="5" y2="5" />
                                  <line x1="19" x2="19" y1="2" y2="8" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                                <span>Upload Asset</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Settings */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold">3</div>
                    <h2 className="text-xl font-semibold">Step 3: Settings</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video Size</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9</SelectItem>
                          <SelectItem value="9:16">9:16</SelectItem>
                          <SelectItem value="1:1">1:1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voice</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background Music</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upbeat">Upbeat</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Digital Human</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avatar1">Avatar 1</SelectItem>
                          <SelectItem value="avatar2">Avatar 2</SelectItem>
                          <SelectItem value="avatar3">Avatar 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 flex justify-center">
                  <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto px-8">
                    Submit Generate Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewAsset(null)}>
          <div className="relative max-w-4xl max-h-[80vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {previewAsset.type === 'image' ? (
              <img src={previewAsset.url} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video src={previewAsset.url} className="w-full h-full object-contain" controls autoPlay />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
              onClick={() => setPreviewAsset(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 11 5 3-5 3v-6Z" />
    </svg>
  )
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  )
}

function VideoFileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 11 5 3-5 3v-6Z" />
    </svg>
  )
}
