import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-[calc(50vh-3.5rem)] flex-col">
      <main className="flex-1">
        <section className="w-full py-4 md:py-8 lg:py-12 xl:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                  {/* Placeholder for video/image with X overlay */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full">
                          <video
                            className="w-full h-full object-cover rounded-xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                          >
                            <source src="https://static.videezy.com/system/resources/previews/000/013/613/original/Social_Media_Marketing_1.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          {/* Overlay with gradient */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent rounded-xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-8">
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-3xl xl:text-5xl/none">
                      Transform <span className="px-2 text-primary text-white bg-purple-600"> Landing Page </span>
                      <br />
                      to <span className="px-2 text-primary text-white bg-orange-600"> Short Video </span>
                    </h1>
                    <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                      Paste the landing page URL, and effortlessly transform static landing page into captivating short video for social media.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="relative flex-1">
                      <Input
                        className="flex-1 text-base sm:min-w-[300px] pr-16"
                        placeholder="https://example.com/landingpage"
                      />
                      <Button size="lg" className="absolute right-0 top-0 rounded-l-none px-4" asChild>
                        <Link href="/generate">
                          Go
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
