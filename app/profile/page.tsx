"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Define asset type interface based on Supabase 'assets' table structure
interface Asset {
  id: number;
  user_id: string;
  type: "image" | "video" | "gif";
  suffix: string;
  url: string;
  md5: string;
  status: number;
  create_time: string;
  update_time: string;
}

// Define task interface based on Supabase 'task' table structure
interface Task {
  id: number;
  user_id: string;
  result_video_url: string;
  status: number; // 0 - generating, 1 - done successfully, 2 - failed
  create_time: string;
  update_time: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Asset[]>([]);
  const [images, setImages] = useState<Asset[]>([]);
  const [gifs, setGifs] = useState<Asset[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);

        // Check if user is logged in with Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Redirect to login page if not logged in
          router.push("/login");
          return;
        }

        setUser(user);

        // Fetch assets and tasks from Supabase after user is authenticated
        await fetchAssets(user.id);
        await fetchTasks(user.id);
      } catch (error) {
        console.error("Error getting user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  // Fetch assets from Supabase and categorize by type
  const fetchAssets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("status", 1) // Only fetch assets with normal status
        .order("create_time", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Categorize assets by type
        const videoAssets = data.filter((asset) => asset.type === "video");
        const imageAssets = data.filter((asset) => asset.type === "image");
        const gifAssets = data.filter((asset) => asset.type === "gif");

        setVideos(videoAssets);
        setImages(imageAssets);
        setGifs(gifAssets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Fetch tasks from Supabase
  const fetchTasks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("task")
        .select("*")
        .eq("user_id", userId)
        .order("create_time", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>

            {user && (
              <div className="mb-8 p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user.email ? user.email[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <h2 className="font-medium">{user.email || user.id}</h2>
                    <p className="text-sm text-muted-foreground">
                      Joined via {user.app_metadata?.provider || "Supabase"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Works</h2>
                <div className="grid gap-4 mt-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {tasks.map((video) => (
                    <div key={video.id} className="space-y-3">
                      <div className="overflow-hidden rounded-md">
                        <div className="aspect-video relative group cursor-pointer">
                          <Image
                            alt={`Video ${video.id}`}
                            className="object-cover transition-transform group-hover:scale-105"
                            src={video.result_video_url}
                            fill
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                              ▶
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium leading-none">
                          Video {video.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(video.create_time),
                            "yyyy-MM-dd HH:mm:ss",
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  Assets
                </h2>
                <Tabs defaultValue="images" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="gifs">Gifs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                      {images.map((image) => (
                        <div key={image.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <Image
                                alt={`Image ${image.id}`}
                                className="object-cover transition-transform group-hover:scale-105"
                                src={image.url}
                                fill
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">
                              Image {image.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(image.create_time),
                                "yyyy-MM-dd HH:mm:ss",
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="videos">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-6">
                      {videos.map((video) => (
                        <div key={video.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <video
                                className="object-cover transition-transform group-hover:scale-105"
                                src={video.url}
                                autoPlay
                                muted
                                loop
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">
                              Video {video.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(video.create_time),
                                "yyyy-MM-dd HH:mm:ss",
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="gifs">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-6">
                      {gifs.map((gif) => (
                        <div key={gif.id} className="space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <div className="aspect-video relative group cursor-pointer">
                              <Image
                                alt={`Gif ${gif.id}`}
                                className="object-cover transition-transform group-hover:scale-105"
                                src={gif.url}
                                fill
                              />

                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full w-12 h-12 border-2 border-white flex items-center justify-center text-white">
                                  ▶
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium leading-none">
                              Gif {gif.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(gif.create_time),
                                "yyyy-MM-dd HH:mm:ss",
                              )}
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
  );
}
