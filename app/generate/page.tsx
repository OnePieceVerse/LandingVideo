"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Film, Heart } from "lucide-react"

export default function GeneratePage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<{type: 'image' | 'video' | 'gif', suffix: string, url: string} | null>(null)
  const [likedAssets, setLikedAssets] = useState<Set<string>>(new Set())
  const [scenes, setScenes] = useState<Array<{id: number, content: string, assets: Array<{type: 'image' | 'video' | 'gif', suffix: string, url: string}>}>>([
    {
      id: 1,
      content: "",
      assets: []
    }
  ])
  const [showAssetsDialog, setShowAssetsDialog] = useState(false)
  const [currentParagraphId, setCurrentParagraphId] = useState<number | null>(null)
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [crawlSuccessful, setCrawlSuccessful] = useState(false)
  const [voiceOptions, setVoiceOptions] = useState<Array<{id: string, name: string}>>([])
  const [bgmOptions, setBgmOptions] = useState<Array<{id: string, name: string}>>([])
  const [transitionOptions, setTransitionOptions] = useState<Array<{id: string, name: string}>>([])

  // Mock assets for the dialog
  const mockAssets = [
    { id: 1, type: 'image', url: 'https://via.placeholder.com/300x200', name: '穿越火线:枪战王者4529.jpg' },
    { id: 2, type: 'image', url: 'https://via.placeholder.com/300x200', name: '穿越火线:枪战王者2089.jpg' },
    { id: 3, type: 'image', url: 'https://via.placeholder.com/300x200', name: '穿越火线:枪战王者7327.jpeg' },
    { id: 4, type: 'video', url: 'https://via.placeholder.com/300x200', name: 'MagStand Magnetic Phone Holder.mp4', duration: '01:16' },
    { id: 5, type: 'video', url: 'https://via.placeholder.com/300x200', name: 'MagStand Magnetic Phone Holder.mp4', duration: '00:09' },
    { id: 6, type: 'video', url: 'https://via.placeholder.com/300x200', name: 'MagStand Magnetic Phone Holder.mp4', duration: '00:10' },
    { id: 7, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'MagStand Magnetic Phone Holder.jpg' },
    { id: 8, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'MagStand Magnetic Phone Holder.jpg' },
    { id: 9, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'Product Image 1.jpg' },
    { id: 10, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'Product Image 2.jpg' },
    { id: 11, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'Product Image 3.jpg' },
    { id: 12, type: 'image', url: 'https://via.placeholder.com/300x200', name: 'Product Image 4.jpg' }
  ];

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
      // Make API call to local API route instead of third-party service
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      // If the API returns paragraph content, update the scenes state
      if (data.scenes) {
        setScenes(data.scenes)
        setCrawlSuccessful(true)
      }
    } catch (error) {
      console.error('Crawl error:', error)
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Failed to crawl URL'}`])
      setCrawlSuccessful(false)
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
    setScenes(prev => prev.map(p => p.id === id ? { ...p, content } : p))
  }

  // Helper function to get file extension/suffix from filename
  const getFileSuffix = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const handleFileUpload = async (paragraphId: number, fileType: 'image' | 'video' | 'gif', file: File) => {
    // Create a temporary URL for preview
    const url = URL.createObjectURL(file);

    // Add the asset to the paragraph
    setScenes(prevScenes => {
      return prevScenes.map(p => {
        if (p.id === paragraphId) {
          return {
            ...p,
            assets: [...p.assets, { type: fileType, suffix: getFileSuffix(file.name), url }]
          };
        }
        return p;
      });
    });
  };

  // Function to handle asset selection from the dialog
  const handleAssetSelect = (asset: any) => {
    if (currentParagraphId) {
      setScenes(prevScenes => {
        return prevScenes.map(p => {
          if (p.id === currentParagraphId) {
            return {
              ...p,
              assets: [...p.assets, { type: asset.type, suffix: getFileSuffix(asset.url), url: asset.url }]
            };
          }
          return p;
        });
      });
    }
    setShowAssetsDialog(false);
  };

  // Function to generate a simple hash from a string
  const generateHash = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return hash.toString(32);

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex string and ensure it's positive
    return (hash >>> 0).toString(32);
  };

  // Function to handle liking an asset
  const handleLikeAsset = async (asset: { type: 'image' | 'video' | 'gif', suffix: string, url: string }, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening preview when clicking like button

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login page if not logged in
        router.push('/login')
        return
      }

      // Generate hash of the asset URL
      const md5Hash = generateHash(asset.url);

      const assetId = `${asset.type}-${asset.url}`;

      // Toggle like status in local state
      const newLikedAssets = new Set(likedAssets);
      if (newLikedAssets.has(assetId)) {
        newLikedAssets.delete(assetId);
      } else {
        newLikedAssets.add(assetId);
      }
      setLikedAssets(newLikedAssets);

      // Save to Supabase
      if (newLikedAssets.has(assetId)) {
        // Insert into assets table
        const { error } = await supabase
          .from('assets')
          .insert([
            {
              user_id: user.id,
              type: asset.type,
              suffix: asset.suffix,
              url: asset.url,
              md5: md5Hash
            }
          ]);

        if (error) {
          console.error('Error saving liked asset:', error);
          // Revert local state if save fails
          newLikedAssets.delete(assetId);
          setLikedAssets(newLikedAssets);
        }
      } else {
        // Remove from assets table
        const { error } = await supabase
          .from('assets')
          .delete()
          .match({
            user_id: user.id,
            url: asset.url
          });

        if (error) {
          console.error('Error removing liked asset:', error);
          // Revert local state if delete fails
          newLikedAssets.add(assetId);
          setLikedAssets(newLikedAssets);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Load liked assets from Supabase on component mount
  useEffect(() => {
    const loadLikedAssets = async () => {
      try {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Fetch liked assets for the current user
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error loading liked assets:', error)
          return
        }

        // Update local state with liked assets
        if (data) {
          const likedSet = new Set<string>();
          data.forEach(item => {
            // Create a unique identifier for each asset
            likedSet.add(`${item.type}-${item.url}`);
          });
          setLikedAssets(likedSet);
        }
      } catch (error) {
        console.error('Error in loadLikedAssets:', error)
      }
    }

    loadLikedAssets()
  }, [])

  // Fetch options from Supabase tables
  useEffect(() => {
    // Default options if tables don't exist or are empty
    const defaultVoiceOptions = [
      { id: '1', name: 'Male' },
      { id: '2', name: 'Female' },
      { id: '3', name: 'Neutral' }
    ]

    const defaultBgmOptions = [
      { id: '1', name: 'BGM 1' },
      { id: '2', name: 'BGM 2' },
      { id: '3', name: 'BGM 3' }
    ]

    const defaultTransitionOptions = [
      { id: '1', name: 'MoveLeft' },
      { id: '2', name: 'MoveRight' }
    ]

    // Generic function to fetch options from any table
    const fetchOptions = async (
      tableName: string,
      setOptions: React.Dispatch<React.SetStateAction<Array<{id: string, name: string}>>>,
      defaultOptions: Array<{id: string, name: string}>
    ) => {
      try {
        // Try to get data from the table
        const { data, error } = await supabase
          .from(tableName)
          .select('id, name')
          .eq('status', '1')

        // If there's data, use it
        if (data && data.length > 0) {
          setOptions(data)
          return
        }

        // If no data but table exists, try to insert default values
        if (!error && data && data.length === 0) {
          const { error: insertError } = await supabase
            .from(tableName)
            .upsert(defaultOptions, { onConflict: 'id' })

          // If insertion successful, fetch the data again
          if (!insertError) {
            const { data: refetchData } = await supabase
              .from(tableName)
              .select('id, name')

            if (refetchData && refetchData.length > 0) {
              setOptions(refetchData)
              return
            }
          }
        }

        // Default fallback for any error case
        setOptions(defaultOptions)
      } catch (error) {
        // Fallback to defaults on any exception
        setOptions(defaultOptions)
      }
    }

    // Fetch all option types
    fetchOptions('voice', setVoiceOptions, defaultVoiceOptions)
    fetchOptions('bgm', setBgmOptions, defaultBgmOptions)
    fetchOptions('transition', setTransitionOptions, defaultTransitionOptions)
  }, []);

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
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900">1</div>
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

                {/* Step 2: Landing Page Content - Only shown after successful crawl */}
                {crawlSuccessful && <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900">2</div>
                    <h2 className="text-xl font-semibold">Step 2: Edit Landing Page Content</h2>
                  </div>
                  <div className="space-y-6">
                    {scenes.map((paragraph) => (
                      <div key={paragraph.id} className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                        <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-b">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="m22 8-6 4 6 4V8Z"/>
                              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                            </svg>
                            <h3 className="font-medium">Scene {paragraph.id}</h3>
                          </div>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"/>
                              <circle cx="19" cy="12" r="1"/>
                              <circle cx="5" cy="12" r="1"/>
                            </svg>
                          </Button>
                        </div>
                        <div className="p-4 flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/2">
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                  <line x1="16" x2="22" y1="5" y2="5"/>
                                  <line x1="19" x2="19" y1="2" y2="8"/>
                                  <circle cx="9" cy="9" r="2"/>
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                                Script
                              </h4>
                            </div>
                            <Textarea
                              placeholder={`Describe scene ${paragraph.id} here...`}
                              value={paragraph.content}
                              onChange={(e) => updateParagraph(paragraph.id, e.target.value)}
                              className="min-h-[150px] resize-none border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                            />
                          </div>
                          <div className="w-full md:w-1/2">
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                  <circle cx="9" cy="9" r="2"/>
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                                Assets ({paragraph.assets.length})
                              </h4>
                            </div>

                            {/* Media preview section */}
                            <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3 max-h-[220px] overflow-y-auto pb-1">
                                {paragraph.assets.length > 0 ? (
                                  paragraph.assets.map((asset, index) => (
                                    <div
                                      key={index}
                                      className="aspect-square bg-white dark:bg-slate-700 rounded-md overflow-hidden relative group cursor-pointer shadow-sm border border-slate-200 dark:border-slate-600"
                                      onClick={() => setPreviewAsset(asset)}
                                    >
                                      {asset.type === 'image' ? (
                                        <img src={asset.url} alt={`Scene ${paragraph.id} asset ${index}`} className="w-full h-full object-cover" />
                                      ) : (
                                        <video src={asset.url} className="w-full h-full object-cover" />
                                      )}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>
                                      {/* Delete button */}
                                      <div
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent opening preview when clicking delete
                                          setScenes(prev => prev.map(p => {
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
                                      {/* Like button */}
                                      <div
                                        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => handleLikeAsset(asset, e)}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
                                        >
                                          <Heart
                                            className={`h-3 w-3 ${likedAssets.has(`${asset.type}-${asset.url}`) ? 'fill-red-500 text-red-500' : 'fill-none'}`}
                                          />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="min-h-[150px] bg-white dark:bg-slate-700/50 rounded-md flex flex-col items-center justify-center col-span-full border border-dashed border-slate-200 dark:border-slate-600">
                                    <div className="text-center p-4">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50">
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                                        <rect width="13" height="9" x="3" y="5" rx="2"/>
                                        <path d="m16 5 3 3-3 3"/>
                                      </svg>
                                      <p className="text-sm text-muted-foreground">No media assets yet</p>
                                      <p className="text-xs text-muted-foreground/70 mt-1">Upload images or videos for this scene</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 mb-2 flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">Supported: JPG, JPEG, PNG, GIF, WAV, MP4</p>
                                <div className="flex space-x-2">
                                  <input
                                    type="file"
                                    accept="image/*,video/*,gif/*"
                                    ref={el => fileInputRefs.current[paragraph.id - 1] = el}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'gif';
                                        handleFileUpload(paragraph.id, fileType, file);
                                        e.target.value = ''; // Reset the input
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center space-x-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                                          <line x1="16" x2="22" y1="5" y2="5" />
                                          <line x1="19" x2="19" y1="2" y2="8" />
                                          <circle cx="9" cy="9" r="2" />
                                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                        <span>Upload Assets</span>
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-54 p-0" align="start">
                                      <div className="py-2">
                                        <button
                                          onClick={() => fileInputRefs.current[paragraph.id - 1]?.click()}
                                          className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                          <div className="flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                              <circle cx="9" cy="9" r="2"/>
                                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                            </svg>
                                          </div>
                                          Upload from device
                                        </button>
                                        <button
                                          className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                          onClick={() => {
                                            setCurrentParagraphId(paragraph.id);
                                            setShowAssetsDialog(true);
                                          }}
                                        >
                                          <div className="flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                              <polyline points="17 8 12 3 7 8" />
                                              <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                          </div>
                                          Choose from Assets
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>}

                {/* Step 3: Settings - Only shown after successful crawl */}
                {crawlSuccessful && <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900">3</div>
                    <h2 className="text-xl font-semibold">Step 3: Settings</h2>
                  </div>
                  <div>
                    <div className="flex items-center overflow-x-auto pt-2 pb-2 -mx-2 px-2">
                      <div className="flex items-center gap-3 flex-nowrap">
                      <Select defaultValue="2">
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[100px] flex items-center h-10">
                            <SelectValue placeholder="9:16" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">16:9</SelectItem>
                            <SelectItem value="2">9:16</SelectItem>
                            <SelectItem value="3">1:1</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* <Select defaultValue="avatar1">
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[180px] flex items-center h-10">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                                <img src="/avatar1.png" alt="" className="w-full h-full object-cover" />
                              </div>
                              <SelectValue placeholder="Avatar" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="avatar1">Avatar 1</SelectItem>
                            <SelectItem value="avatar2">Avatar 2</SelectItem>
                            <SelectItem value="avatar3">Avatar 3</SelectItem>
                          </SelectContent>
                        </Select> */}

                        {/* Voice */}
                        <Select defaultValue={voiceOptions.length > 0 ? voiceOptions[0].id : ""}>
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[180px] flex items-center h-10">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                  <line x1="12" x2="12" y1="19" y2="22"></line>
                                </svg>
                              </div>
                              <SelectValue placeholder="Voice" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {voiceOptions.length > 0 ? (
                              voiceOptions.map((voice) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                  {voice.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>Loading voices...</SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {/* BGM */}
                        <Select defaultValue={bgmOptions.length > 0 ? bgmOptions[0].id : ""}>
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[180px] flex items-center h-10">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                              </div>
                              <SelectValue placeholder="BGM" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {bgmOptions.length > 0 ? (
                              bgmOptions.map((bgm) => (
                                <SelectItem key={bgm.id} value={bgm.id}>
                                  {bgm.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>Loading BGMs...</SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {/* Transition */}
                        <Select defaultValue={transitionOptions.length > 0 ? transitionOptions[0].id : ""}>
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[120px] flex items-center h-10">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <Film size={16} />
                              </div>
                            </div>
                            <SelectValue placeholder="Transition" />
                          </SelectTrigger>
                          <SelectContent>
                            {transitionOptions.length > 0 ? (
                              transitionOptions.map((transition) => (
                                <SelectItem key={transition.id} value={transition.id}>
                                  {transition.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>Loading transitions...</SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {/* Enhance Assets */}
                        <Select defaultValue="2">
                          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[120px] flex items-center h-10">
                            <SelectValue placeholder="Enhance" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="1">Enhance Assets</SelectItem>
                            <SelectItem value="2">No Enhance Assets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>}

                {/* Generate Button - Only shown after successful crawl */}
                {crawlSuccessful && <div className="pt-4 flex justify-center">
                  <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto px-8">
                    Submit Task
                  </Button>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Assets Selection Dialog */}
      <Dialog open={showAssetsDialog} onOpenChange={setShowAssetsDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select media</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div className="flex items-center">
              <span className="mr-2 text-sm">Sort by</span>
              <Button variant="outline" size="sm" className="flex items-center">
                <span className="mr-1">Date</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mockAssets.map((asset) => (
              <div key={asset.id} className="relative group cursor-pointer" onClick={() => handleAssetSelect(asset)}>
                <div className="absolute top-2 left-2 z-10">
                  <div className="h-6 w-6 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full"></div>
                  </div>
                </div>
                <div className="relative aspect-square bg-slate-100 rounded-md overflow-hidden">
                  {asset.type === 'video' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {asset.duration}
                    </div>
                  )}
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs mt-1 truncate">{asset.name}</p>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAssetsDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAssetsDialog(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewAsset(null)}>
          <div className="relative max-w-4xl max-h-[80vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {previewAsset.type === 'image' ? (
              <img src={previewAsset.url} alt="Preview" className="w-full h-full object-contain" />
            ) : previewAsset.type === 'video' ? (
              <video src={previewAsset.url} className="w-full h-full object-contain" controls autoPlay />
            ) : (
              <img src={previewAsset.url} alt="GIF Preview" className="w-full h-full object-contain" />
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
