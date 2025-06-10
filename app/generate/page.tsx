"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { uploadFileToCOS, getFileType, getFileExtension } from "@/lib/cos";
import { useRouter } from "next/navigation";
import { Film, Heart } from "lucide-react";
import Image from "next/image";

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{
    type: "image" | "video" | "gif";
    suffix: string;
    url: string;
    uploading?: boolean;
  } | null>(null);
  const [likedAssets, setLikedAssets] = useState<Set<string>>(new Set());
  const [scenes, setScenes] = useState<
    Array<{
      id: number;
      content: string;
      assets: Array<{
        type: "image" | "video" | "gif";
        suffix: string;
        url: string;
        uploading?: boolean;
      }>;
    }>
  >([
    {
      id: 1,
      content: "",
      assets: [],
    },
  ]);
  const [showAssetsDialog, setShowAssetsDialog] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<number | null>(null);
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [crawlSuccessful, setCrawlSuccessful] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [bgmOptions, setBgmOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [transitionOptions, setTransitionOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Real assets from Supabase
  const [userAssets, setUserAssets] = useState<
    Array<{
      id: number;
      type: "image" | "video" | "gif";
      url: string;
    }>
  >([]);

  // Load assets from Supabase
  useEffect(() => {
    const loadUserAssets = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Fetch assets from the 'assets' table
        const { data, error } = await supabase
          .from("assets")
          .select("id, type, url")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading assets:", error);
          return;
        }

        // Update assets state
        if (data) {
          setUserAssets(data);
        }
      } catch (error) {
        console.error("Error in loadAssets:", error);
      }
    };

    loadUserAssets();
  }, []);

  const handleCrawl = async () => {
    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login page if not logged in
      router.push("/login");
      return;
    }

    // Validate URL
    if (!url.trim()) {
      setLogs(["Error: Please enter a valid URL"]);
      return;
    }

    // Proceed with crawling if logged in
    setLoading(true);
    setLogs(["Crawling landing page content..."]);

    try {
      // Make API call to local API route instead of third-party service
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Update logs with response from backend
      setLogs((prev) => [
        ...prev,
        "Crawl successful",
        "Generating scene content...",
      ]);

      // If the API returns scene content, update the scenes state
      if (data.scenes) {
        setScenes(data.scenes);
        setCrawlSuccessful(true);
      }
    } catch (error) {
      console.error("Crawl error:", error);
      setLogs((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : "Failed to crawl URL"}`,
      ]);
      setCrawlSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    setLoading(true);
    setLogs((prev) => [
      ...prev,
      "generating video...",
      "video generated successfully: https://example.com/video.mp4",
    ]);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const updateScene = (id: number, content: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const handleFileUpload = async (
    sceneId: number,
    fileType: "image" | "video" | "gif",
    file: File,
  ) => {
    try {
      // Show loading state by adding a temporary placeholder
      const tempAsset = {
        type: fileType,
        suffix: getFileExtension(file.name),
        url: "uploading", // Temporary placeholder
        uploading: true,
      };

      // Add temporary asset to show loading state
      setScenes((prevScenes) => {
        return prevScenes.map((p) => {
          if (p.id === sceneId) {
            return {
              ...p,
              assets: [...p.assets, tempAsset],
            };
          }
          return p;
        });
      });

      // Upload file to Tencent COS
      const cosFileUrl = await uploadFileToCOS(file);

      // Update the scene with the actual COS URL
      setScenes((prevScenes) => {
        return prevScenes.map((p) => {
          if (p.id === sceneId) {
            // Replace the temporary asset with the actual one
            const updatedAssets = p.assets.map((asset) => {
              if (asset.url === "uploading" && asset.uploading) {
                return {
                  type: fileType,
                  suffix: getFileExtension(file.name),
                  url: cosFileUrl,
                };
              }
              return asset;
            });
            return {
              ...p,
              assets: updatedAssets,
            };
          }
          return p;
        });
      });

      console.log("File uploaded successfully to COS:", cosFileUrl);
    } catch (error) {
      console.error("Error uploading file to COS:", error);

      // Remove the temporary asset on error
      setScenes((prevScenes) => {
        return prevScenes.map((p) => {
          if (p.id === sceneId) {
            return {
              ...p,
              assets: p.assets.filter(
                (asset) => !(asset.url === "uploading" && asset.uploading),
              ),
            };
          }
          return p;
        });
      });

      // Show error to user (you might want to add a proper error toast here)
      alert("Failed to upload file. Please try again.");
    }
  };

  // Function to handle asset selection from the dialog
  const handleAssetSelect = (asset: any) => {
    if (currentSceneId) {
      setScenes((prevScenes) => {
        return prevScenes.map((p) => {
          if (p.id === currentSceneId) {
            return {
              ...p,
              assets: [
                ...p.assets,
                {
                  type: asset.type,
                  suffix: getFileExtension(asset.url),
                  url: asset.url,
                },
              ],
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
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex string and ensure it's positive
    return (hash >>> 0).toString(32);
  };

  // Function to handle liking an asset
  const handleLikeAsset = async (
    asset: { type: "image" | "video" | "gif"; suffix: string; url: string },
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Prevent opening preview when clicking like button

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login page if not logged in
        router.push("/login");
        return;
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
        const { error } = await supabase.from("assets").insert([
          {
            user_id: user.id,
            type: asset.type,
            suffix: asset.suffix,
            url: asset.url,
            md5: md5Hash,
          },
        ]);

        if (error) {
          console.error("Error saving liked asset:", error);
          // Revert local state if save fails
          newLikedAssets.delete(assetId);
          setLikedAssets(newLikedAssets);
        }
      } else {
        // Remove from assets table
        const { error } = await supabase.from("assets").delete().match({
          user_id: user.id,
          url: asset.url,
        });

        if (error) {
          console.error("Error removing liked asset:", error);
          // Revert local state if delete fails
          newLikedAssets.add(assetId);
          setLikedAssets(newLikedAssets);
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Load liked assets from Supabase on component mount
  useEffect(() => {
    const loadLikedAssets = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Fetch liked assets for the current user
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading liked assets:", error);
          return;
        }

        // Update local state with liked assets
        if (data) {
          const likedSet = new Set<string>();
          data.forEach((item) => {
            // Create a unique identifier for each asset
            likedSet.add(`${item.type}-${item.url}`);
          });
          setLikedAssets(likedSet);
        }
      } catch (error) {
        console.error("Error in loadLikedAssets:", error);
      }
    };

    loadLikedAssets();
  }, []);

  // Fetch options from Supabase tables
  useEffect(() => {
    // Default options if tables don't exist or are empty
    const defaultVoiceOptions = [
      { id: "1", name: "Male" },
      { id: "2", name: "Female" },
      { id: "3", name: "Neutral" },
    ];

    const defaultBgmOptions = [
      { id: "1", name: "BGM 1" },
      { id: "2", name: "BGM 2" },
      { id: "3", name: "BGM 3" },
    ];

    const defaultTransitionOptions = [
      { id: "1", name: "MoveLeft" },
      { id: "2", name: "MoveRight" },
    ];

    // Generic function to fetch options from any table
    const fetchOptions = async (
      tableName: string,
      setOptions: React.Dispatch<
        React.SetStateAction<Array<{ id: string; name: string }>>
      >,

      defaultOptions: Array<{ id: string; name: string }>,
    ) => {
      try {
        // Try to get data from the table
        const { data, error } = await supabase
          .from(tableName)
          .select("id, name")
          .eq("status", "1");

        // If there's data, use it
        if (data && data.length > 0) {
          setOptions(data);
          return;
        }

        // If no data but table exists, try to insert default values
        if (!error && data && data.length === 0) {
          const { error: insertError } = await supabase
            .from(tableName)
            .upsert(defaultOptions, { onConflict: "id" });

          // If insertion successful, fetch the data again
          if (!insertError) {
            const { data: refetchData } = await supabase
              .from(tableName)
              .select("id, name");

            if (refetchData && refetchData.length > 0) {
              setOptions(refetchData);
              return;
            }
          }
        }

        // Default fallback for any error case
        setOptions(defaultOptions);
      } catch (error) {
        // Fallback to defaults on any exception
        setOptions(defaultOptions);
      }
    };

    // Fetch all option types
    fetchOptions("voice", setVoiceOptions, defaultVoiceOptions);
    fetchOptions("bgm", setBgmOptions, defaultBgmOptions);
    fetchOptions("transition", setTransitionOptions, defaultTransitionOptions);
  }, []);

  return (
    <div
      className="flex min-h-[calc(100vh-3.5rem)] flex-col"
      data-oid="2x7...p"
    >
      <main className="flex-1" data-oid="alv.ie0">
        <div className="container mx-auto px-4 md:px-6 py-6" data-oid="0hpw8_7">
          <div className="mx-auto max-w-7xl" data-oid="zbv5:b8">
            <div className="grid gap-6" data-oid="ca43fhg">
              <div className="space-y-8" data-oid="3evnho-">
                {/* Step 1: Landing Page URL */}
                <div className="border rounded-lg p-6" data-oid="09o_xpo">
                  <div className="flex items-center mb-4" data-oid="i0pv293">
                    <div
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900"
                      data-oid="9ks3syo"
                    >
                      1
                    </div>
                    <h2 className="text-xl font-semibold" data-oid="gpdqmot">
                      Step 1: Crawl Landing Page
                    </h2>
                  </div>
                  <div className="flex space-x-2" data-oid="jw1ruwo">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/landingpage"
                      className="flex-1"
                      data-oid="kq5-i0b"
                    />

                    <Button
                      onClick={handleCrawl}
                      disabled={loading}
                      data-oid="g11b298"
                    >
                      {loading ? "Crawling..." : "Crawl"}
                    </Button>
                  </div>
                </div>

                {/* Step 2: Landing Page Content - Only shown after successful crawl */}
                {crawlSuccessful && (
                  <div className="border rounded-lg p-6" data-oid="g90s_as">
                    <div className="flex items-center mb-4" data-oid="n:061.6">
                      <div
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900"
                        data-oid="id7j_9g"
                      >
                        2
                      </div>
                      <h2 className="text-xl font-semibold" data-oid="9ev689f">
                        Step 2: Edit Video Scenes
                      </h2>
                    </div>
                    <div className="space-y-6" data-oid="d4g71s4">
                      {scenes.map((scene) => (
                        <div
                          key={scene.id}
                          className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-900"
                          data-oid="ovlc7ri"
                        >
                          <div
                            className="bg-muted/30 px-4 py-3 flex items-center justify-between border-b"
                            data-oid="ps420my"
                          >
                            <div
                              className="flex items-center gap-2"
                              data-oid=".x.plu8"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                                data-oid="-8nonw9"
                              >
                                <path d="m22 8-6 4 6 4V8Z" data-oid="q7p:9g9" />
                                <rect
                                  width="14"
                                  height="12"
                                  x="2"
                                  y="6"
                                  rx="2"
                                  ry="2"
                                  data-oid="sa:3sus"
                                />
                              </svg>
                              <h3 className="font-medium" data-oid="4iavhtf">
                                Scene {scene.id}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary"
                              data-oid="xw39cfz"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                data-oid="k5il8oh"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="1"
                                  data-oid="543xj:0"
                                />

                                <circle
                                  cx="19"
                                  cy="12"
                                  r="1"
                                  data-oid="k6xl0:_"
                                />

                                <circle
                                  cx="5"
                                  cy="12"
                                  r="1"
                                  data-oid="a4ku529"
                                />
                              </svg>
                            </Button>
                          </div>
                          <div
                            className="p-4 flex flex-col md:flex-row gap-6"
                            data-oid="55:62gd"
                          >
                            <div className="w-full md:w-1/2" data-oid="t35symh">
                              <div className="mb-3" data-oid="ve.g1m9">
                                <h4
                                  className="text-sm font-medium text-muted-foreground flex items-center gap-2"
                                  data-oid="qinmcpx"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    data-oid="ahcrwik"
                                  >
                                    <path
                                      d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                                      data-oid="5-jgpz6"
                                    />

                                    <polyline
                                      points="14 2 14 8 20 8"
                                      data-oid="0_zrq1i"
                                    />

                                    <line
                                      x1="16"
                                      x2="22"
                                      y1="5"
                                      y2="5"
                                      data-oid="lhv:3gv"
                                    />

                                    <line
                                      x1="19"
                                      x2="19"
                                      y1="2"
                                      y2="8"
                                      data-oid="ex7daqu"
                                    />

                                    <circle
                                      cx="9"
                                      cy="9"
                                      r="2"
                                      data-oid="-cyqkcw"
                                    />

                                    <path
                                      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                      data-oid="ltw604:"
                                    />
                                  </svg>
                                  Script
                                </h4>
                              </div>
                              <Textarea
                                placeholder={`Describe scene ${scene.id} here...`}
                                value={scene.content}
                                onChange={(e) =>
                                  updateScene(scene.id, e.target.value)
                                }
                                className="min-h-[150px] resize-none border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                                data-oid="jo_3qne"
                              />
                            </div>
                            <div className="w-full md:w-1/2" data-oid="y2p-1yq">
                              <div className="mb-3" data-oid="01aji02">
                                <h4
                                  className="text-sm font-medium text-muted-foreground flex items-center gap-2"
                                  data-oid="uan3hw7"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    data-oid="7jmrh3x"
                                  >
                                    <rect
                                      width="18"
                                      height="18"
                                      x="3"
                                      y="3"
                                      rx="2"
                                      ry="2"
                                      data-oid="eehjg3u"
                                    />

                                    <circle
                                      cx="9"
                                      cy="9"
                                      r="2"
                                      data-oid="kwubkm-"
                                    />

                                    <path
                                      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                      data-oid="d6sprwm"
                                    />
                                  </svg>
                                  Assets ({scene.assets.length})
                                </h4>
                              </div>

                              {/* Media preview section */}
                              <div
                                className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50"
                                data-oid="dprjae_"
                              >
                                <div
                                  className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3 max-h-[220px] overflow-y-auto pb-1"
                                  data-oid="q2b4f_h"
                                >
                                  {scene.assets.length > 0 ? (
                                    scene.assets.map((asset, index) => (
                                      <div
                                        key={index}
                                        className="aspect-square bg-white dark:bg-slate-700 rounded-md overflow-hidden relative group cursor-pointer shadow-sm border border-slate-200 dark:border-slate-600"
                                        onClick={() =>
                                          !asset.uploading &&
                                          setPreviewAsset(asset)
                                        }
                                        data-oid="en_g71-"
                                      >
                                        {asset.uploading ? (
                                          <div
                                            className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-600"
                                            data-oid="b5wa01x"
                                          >
                                            <div
                                              className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                                              data-oid="ky8vktu"
                                            ></div>
                                          </div>
                                        ) : asset.type === "video" ? (
                                          <video
                                            src={asset.url}
                                            className="w-full h-full object-cover"
                                            muted
                                            data-oid="-w97cs6"
                                          />
                                        ) : (
                                          <Image
                                            src={asset.url}
                                            alt={`Scene ${scene.id} asset ${index}`}
                                            className="object-cover"
                                            fill
                                            data-oid="wboza1v"
                                          />
                                        )}
                                        <div
                                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"
                                          data-oid="7j:vmvs"
                                        ></div>
                                        {/* Delete button */}
                                        {!asset.uploading && (
                                          <div
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent opening preview when clicking delete
                                              setScenes((prev) =>
                                                prev.map((p) => {
                                                  if (p.id === scene.id) {
                                                    return {
                                                      ...p,
                                                      assets: p.assets.filter(
                                                        (_, i) => i !== index,
                                                      ),
                                                    };
                                                  }
                                                  return p;
                                                }),
                                              );
                                            }}
                                            data-oid="i7c1a0p"
                                          >
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
                                              data-oid="bvcg.y_"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-3 w-3"
                                                data-oid=".rzdgc."
                                              >
                                                <path
                                                  d="M18 6 6 18"
                                                  data-oid="prcco97"
                                                ></path>
                                                <path
                                                  d="m6 6 12 12"
                                                  data-oid="ng2edrb"
                                                ></path>
                                              </svg>
                                            </Button>
                                          </div>
                                        )}
                                        {/* Like button */}
                                        {!asset.uploading && (
                                          <div
                                            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) =>
                                              handleLikeAsset(asset, e)
                                            }
                                            data-oid="-lr8f6z"
                                          >
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
                                              data-oid="g8uzg32"
                                            >
                                              <Heart
                                                className={`h-3 w-3 ${likedAssets.has(`${asset.type}-${asset.url}`) ? "fill-red-500 text-red-500" : "fill-none"}`}
                                                data-oid="8:q7r:3"
                                              />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div
                                      className="min-h-[150px] bg-white dark:bg-slate-700/50 rounded-md flex flex-col items-center justify-center col-span-full border border-dashed border-slate-200 dark:border-slate-600"
                                      data-oid="ydpw81g"
                                    >
                                      <div
                                        className="text-center p-4"
                                        data-oid="x0n_5f3"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50"
                                          data-oid=":yjeinu"
                                        >
                                          <path
                                            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"
                                            data-oid="pokhren"
                                          />

                                          <rect
                                            width="13"
                                            height="9"
                                            x="3"
                                            y="5"
                                            rx="2"
                                            data-oid="o_6axxt"
                                          />

                                          <path
                                            d="m16 5 3 3-3 3"
                                            data-oid="v4fdkav"
                                          />
                                        </svg>
                                        <p
                                          className="text-sm text-muted-foreground"
                                          data-oid="sy_wvm8"
                                        >
                                          No media assets yet
                                        </p>
                                        <p
                                          className="text-xs text-muted-foreground/70 mt-1"
                                          data-oid="_765tyl"
                                        >
                                          Upload images or videos for this scene
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div
                                  className="mt-2 mb-2 flex justify-between items-center"
                                  data-oid="ugud_cf"
                                >
                                  <p
                                    className="text-xs text-muted-foreground"
                                    data-oid="brmtyfk"
                                  >
                                    Supported: JPG, JPEG, PNG, GIF, WAV, MP4
                                  </p>
                                  <div
                                    className="flex space-x-2"
                                    data-oid="uq0-hz0"
                                  >
                                    <input
                                      type="file"
                                      accept="image/*,video/*,gif/*"
                                      ref={(el) =>
                                        (fileInputRefs.current[scene.id - 1] =
                                          el)
                                      }
                                      onChange={(e) => {
                                        if (
                                          e.target.files &&
                                          e.target.files[0]
                                        ) {
                                          const file = e.target.files[0];
                                          const fileType = file.type.startsWith(
                                            "image/",
                                          )
                                            ? "image"
                                            : file.type.startsWith("video/")
                                              ? "video"
                                              : "gif";
                                          handleFileUpload(
                                            scene.id,
                                            fileType,
                                            file,
                                          );
                                          e.target.value = ""; // Reset the input
                                        }
                                      }}
                                      className="hidden"
                                      data-oid="3m._i5h"
                                    />

                                    <Popover data-oid="eev6d.y">
                                      <PopoverTrigger
                                        asChild
                                        data-oid="6vgfvic"
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center space-x-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                          data-oid="zi86:vf"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                            data-oid="w2zfsxj"
                                          >
                                            <path
                                              d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"
                                              data-oid="a.:_oat"
                                            />

                                            <line
                                              x1="16"
                                              x2="22"
                                              y1="5"
                                              y2="5"
                                              data-oid="m5sycho"
                                            />

                                            <line
                                              x1="19"
                                              x2="19"
                                              y1="2"
                                              y2="8"
                                              data-oid="o9jjk54"
                                            />

                                            <circle
                                              cx="9"
                                              cy="9"
                                              r="2"
                                              data-oid="uc_ek.1"
                                            />

                                            <path
                                              d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                              data-oid="h0vl_y1"
                                            />
                                          </svg>
                                          <span data-oid="1aa2n:h">
                                            Upload Assets
                                          </span>
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-54 p-0"
                                        align="start"
                                        data-oid="cy5y1.5"
                                      >
                                        <div
                                          className="py-2"
                                          data-oid="dd:rw5x"
                                        >
                                          <button
                                            onClick={() =>
                                              fileInputRefs.current[
                                                scene.id - 1
                                              ]?.click()
                                            }
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            data-oid="m8df:tg"
                                          >
                                            <div
                                              className="flex items-center justify-center"
                                              data-oid="2759bbw"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                data-oid="hcdd_pv"
                                              >
                                                <rect
                                                  width="18"
                                                  height="18"
                                                  x="3"
                                                  y="3"
                                                  rx="2"
                                                  ry="2"
                                                  data-oid="exhdf0d"
                                                />

                                                <circle
                                                  cx="9"
                                                  cy="9"
                                                  r="2"
                                                  data-oid="0k654r6"
                                                />

                                                <path
                                                  d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                                  data-oid="4bp4ayl"
                                                />
                                              </svg>
                                            </div>
                                            Upload from device
                                          </button>
                                          <button
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => {
                                              setCurrentSceneId(scene.id);
                                              setShowAssetsDialog(true);
                                            }}
                                            data-oid="46al58h"
                                          >
                                            <div
                                              className="flex items-center justify-center"
                                              data-oid="ic8iy2r"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                data-oid="4605976"
                                              >
                                                <path
                                                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                                  data-oid="s-sbjgy"
                                                />

                                                <polyline
                                                  points="17 8 12 3 7 8"
                                                  data-oid="k4yh.vw"
                                                />

                                                <line
                                                  x1="12"
                                                  y1="3"
                                                  x2="12"
                                                  y2="15"
                                                  data-oid="dhe1..v"
                                                />
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
                  </div>
                )}

                {/* Step 3: Settings - Only shown after successful crawl */}
                {crawlSuccessful && (
                  <div className="border rounded-lg p-6" data-oid="sv275l9">
                    <div className="flex items-center mb-4" data-oid="hn4gi04">
                      <div
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-semibold dark:text-slate-900"
                        data-oid="b::cz4j"
                      >
                        3
                      </div>
                      <h2 className="text-xl font-semibold" data-oid="52lmbk3">
                        Step 3: Video Settings
                      </h2>
                    </div>
                    <div data-oid="j3qjvg5">
                      <div
                        className="flex items-center overflow-x-auto pt-2 pb-2 -mx-2 px-2"
                        data-oid="tbz2w58"
                      >
                        <div
                          className="flex items-center gap-3 flex-nowrap"
                          data-oid="1-iocrx"
                        >
                          <Select defaultValue="2" data-oid="ff3_::3">
                            <SelectTrigger
                              className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[100px] flex items-center h-10"
                              data-oid="1g9esnt"
                            >
                              <SelectValue
                                placeholder="9:16"
                                data-oid="9ym1efe"
                              />
                            </SelectTrigger>
                            <SelectContent data-oid="nowu5fr">
                              <SelectItem value="1" data-oid="o2-b.0m">
                                16:9
                              </SelectItem>
                              <SelectItem value="2" data-oid=".zun4c:">
                                9:16
                              </SelectItem>
                              <SelectItem value="3" data-oid="4k12olb">
                                1:1
                              </SelectItem>
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
                          <Select
                            defaultValue={
                              voiceOptions.length > 0 ? voiceOptions[0].id : ""
                            }
                            data-oid="6.oipzw"
                          >
                            <SelectTrigger
                              className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[180px] flex items-center h-10"
                              data-oid="ttym86."
                            >
                              <div
                                className="flex items-center gap-2"
                                data-oid="ru7bxg2"
                              >
                                <div
                                  className="w-5 h-5 flex items-center justify-center"
                                  data-oid="9rjycf5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    data-oid="hve3y3e"
                                  >
                                    <path
                                      d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                                      data-oid="sfgegz0"
                                    ></path>
                                    <path
                                      d="M19 10v2a7 7 0 0 1-14 0v-2"
                                      data-oid="84fjw7n"
                                    ></path>
                                    <line
                                      x1="12"
                                      x2="12"
                                      y1="19"
                                      y2="22"
                                      data-oid="m5id7o0"
                                    ></line>
                                  </svg>
                                </div>
                                <SelectValue
                                  placeholder="Voice"
                                  data-oid="titupm-"
                                />
                              </div>
                            </SelectTrigger>
                            <SelectContent data-oid="bc-4rwj">
                              {voiceOptions.length > 0 ? (
                                voiceOptions.map((voice) => (
                                  <SelectItem
                                    key={voice.id}
                                    value={voice.id}
                                    data-oid="0nez0:3"
                                  >
                                    {voice.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem
                                  value="loading"
                                  disabled
                                  data-oid="cm8n1o6"
                                >
                                  Loading voices...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          {/* BGM */}
                          <Select
                            defaultValue={
                              bgmOptions.length > 0 ? bgmOptions[0].id : ""
                            }
                            data-oid="_flm.8s"
                          >
                            <SelectTrigger
                              className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[180px] flex items-center h-10"
                              data-oid="60wjqqc"
                            >
                              <div
                                className="flex items-center gap-2"
                                data-oid="-6eg9eq"
                              >
                                <div
                                  className="w-5 h-5 flex items-center justify-center"
                                  data-oid="exxiwzn"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    data-oid="vb0-q6g"
                                  >
                                    <path
                                      d="M9 18V5l12-2v13"
                                      data-oid="1dnmw3u"
                                    ></path>
                                    <circle
                                      cx="6"
                                      cy="18"
                                      r="3"
                                      data-oid=".wq_c1u"
                                    ></circle>
                                    <circle
                                      cx="18"
                                      cy="16"
                                      r="3"
                                      data-oid=":x0n.bq"
                                    ></circle>
                                  </svg>
                                </div>
                                <SelectValue
                                  placeholder="BGM"
                                  data-oid="io4_xo3"
                                />
                              </div>
                            </SelectTrigger>
                            <SelectContent data-oid="f:ac.6_">
                              {bgmOptions.length > 0 ? (
                                bgmOptions.map((bgm) => (
                                  <SelectItem
                                    key={bgm.id}
                                    value={bgm.id}
                                    data-oid="s:cnmzi"
                                  >
                                    {bgm.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem
                                  value="loading"
                                  disabled
                                  data-oid="mmhko.y"
                                >
                                  Loading BGMs...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          {/* Transition */}
                          <Select
                            defaultValue={
                              transitionOptions.length > 0
                                ? transitionOptions[0].id
                                : ""
                            }
                            data-oid="gtpqo74"
                          >
                            <SelectTrigger
                              className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[120px] flex items-center h-10"
                              data-oid="9gql6qi"
                            >
                              <div
                                className="flex items-center gap-2"
                                data-oid="7j6i4hn"
                              >
                                <div
                                  className="w-5 h-5 flex items-center justify-center"
                                  data-oid="g0xi-fg"
                                >
                                  <Film size={16} data-oid="kzd0-vi" />
                                </div>
                              </div>
                              <SelectValue
                                placeholder="Transition"
                                data-oid="avcncf-"
                              />
                            </SelectTrigger>
                            <SelectContent data-oid="_csf78.">
                              {transitionOptions.length > 0 ? (
                                transitionOptions.map((transition) => (
                                  <SelectItem
                                    key={transition.id}
                                    value={transition.id}
                                    data-oid="pk951vm"
                                  >
                                    {transition.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem
                                  value="loading"
                                  disabled
                                  data-oid="pemfo7b"
                                >
                                  Loading transitions...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          {/* Enhance Assets */}
                          <Select defaultValue="2" data-oid="y3cwef4">
                            <SelectTrigger
                              className="bg-gray-100 dark:bg-slate-800 border-0 rounded-full px-4 min-w-[120px] flex items-center h-10"
                              data-oid="zv4fydh"
                            >
                              <SelectValue
                                placeholder="Enhance"
                                data-oid="i029d.0"
                              />
                            </SelectTrigger>
                            <SelectContent data-oid="6-f8t5c">
                              <SelectItem value="1" data-oid="5:i2yl9">
                                Enhance Assets
                              </SelectItem>
                              <SelectItem value="2" data-oid="0ncyouv">
                                No Enhance Assets
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button - Only shown after successful crawl */}
                {crawlSuccessful && (
                  <div className="pt-4 flex justify-center" data-oid="zbnb05m">
                    <Button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="w-full md:w-auto px-8"
                      data-oid="xckbu3a"
                    >
                      Submit Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Assets Selection Dialog */}
      <Dialog
        open={showAssetsDialog}
        onOpenChange={setShowAssetsDialog}
        data-oid="bi-shwa"
      >
        <DialogContent
          className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto"
          data-oid="694u78r"
        >
          <DialogHeader data-oid="wb--9k_">
            <DialogTitle data-oid="1ah1tr6">Select media</DialogTitle>
          </DialogHeader>
          <div
            className="flex justify-between items-center mb-4"
            data-oid="1ppnnzk"
          >
            <div data-oid="adkmf27"></div>
            <div className="flex items-center" data-oid="_2ig7xz">
              <span className="mr-2 text-sm" data-oid="z0_xl4a">
                Sort by
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                data-oid="pq6379m"
              >
                <span className="mr-1" data-oid="nuvsr58">
                  Date
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  data-oid="h53fc2q"
                >
                  <polyline
                    points="6 9 12 15 18 9"
                    data-oid="tfhduoi"
                  ></polyline>
                </svg>
              </Button>
            </div>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            data-oid="z81---u"
          >
            {userAssets.map((asset) => (
              <div
                key={asset.id}
                className="relative group cursor-pointer"
                onClick={() => handleAssetSelect(asset)}
                data-oid="ycumul-"
              >
                <div className="absolute top-2 left-2 z-10" data-oid="r:fgtai">
                  <div
                    className="h-6 w-6 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center"
                    data-oid="58hlwvk"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      data-oid=".5y-iqo"
                    ></div>
                  </div>
                </div>
                <div
                  className="relative aspect-square bg-slate-100 rounded-md overflow-hidden"
                  data-oid=".w.8:pw"
                >
                  {asset.type === "video" ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      data-oid="2u52sin"
                    />
                  ) : (
                    <Image
                      src={asset.url}
                      alt={asset.id.toString()}
                      className="object-cover"
                      fill
                      data-oid="rtfq_wf"
                    />
                  )}
                </div>
                <p className="text-xs mt-1 truncate" data-oid="pg4o75m">
                  {asset.id}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6" data-oid="oz11fq-">
            <Button
              variant="outline"
              onClick={() => setShowAssetsDialog(false)}
              data-oid="i3xn:-t"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowAssetsDialog(false)}
              data-oid="v2q:umo"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewAsset(null)}
          data-oid="1sd2xg5"
        >
          <div
            className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            data-oid="rdojy:g"
          >
            {previewAsset.type === "image" ? (
              <Image
                src={previewAsset.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                width={800}
                height={600}
                style={{ width: "auto", height: "auto" }}
                data-oid="hrly381"
              />
            ) : previewAsset.type === "video" ? (
              <video
                src={previewAsset.url}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                data-oid="f8gbpzd"
              />
            ) : (
              <Image
                src={previewAsset.url}
                alt="GIF Preview"
                className="max-w-full max-h-full object-contain"
                width={800}
                height={600}
                style={{ width: "auto", height: "auto" }}
                data-oid="k.ftz-k"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white hover:text-white hover:bg-red-500/90"
              onClick={() => setPreviewAsset(null)}
              data-oid="u_n8eah"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                data-oid="bw8rgrk"
              >
                <path d="M18 6 6 18" data-oid="i5af7.v"></path>
                <path d="m6 6 12 12" data-oid="gcpgq5a"></path>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
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
      data-oid="izqlt-v"
    >
      <path
        d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        data-oid="ocrfw4h"
      />

      <polyline points="14 2 14 8 20 8" data-oid="rv0-zme" />
      <path d="m10 11 5 3-5 3v-6Z" data-oid="jwebykx" />
    </svg>
  );
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
      data-oid="yx5vx8n"
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        ry="2"
        data-oid="70yp8ae"
      />

      <circle cx="9" cy="9" r="2" data-oid="-w50j2_" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" data-oid="sfq-5_." />
    </svg>
  );
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
      data-oid="hmfi51x"
    >
      <path d="m22 8-6 4 6 4V8Z" data-oid="irtggi6" />
      <rect
        width="14"
        height="12"
        x="2"
        y="6"
        rx="2"
        ry="2"
        data-oid="j8a.zkb"
      />
    </svg>
  );
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
      data-oid="dc.m55."
    >
      <path
        d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        data-oid="2g41r1_"
      />

      <polyline points="14 2 14 8 20 8" data-oid="bw01._j" />
      <path d="m10 11 5 3-5 3v-6Z" data-oid="uhrxy5o" />
    </svg>
  );
}
