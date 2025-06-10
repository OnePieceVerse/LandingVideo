import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-[calc(50vh-3.5rem)] flex-col" data-oid="9qq-2z-">
      <main className="flex-1" data-oid="n-2gzk6">
        <section
          className="w-full py-4 md:py-8 lg:py-12 xl:py-16"
          data-oid="2yccwve"
        >
          <div className="container mx-auto px-4 md:px-6" data-oid="2sjkskx">
            <div className="mx-auto max-w-7xl" data-oid="j63x:x5">
              <div
                className="grid gap-6 lg:grid-cols-2 lg:gap-12"
                data-oid="-jwn82x"
              >
                <div
                  className="relative aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center"
                  data-oid="fh_ni95"
                >
                  {/* Placeholder for video/image with X overlay */}
                  <div
                    className="w-full h-full flex items-center justify-center"
                    data-oid="qvmnezk"
                  >
                    <div className="relative w-full h-full" data-oid=".nap.0n">
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        data-oid="1kdpnk2"
                      >
                        <div className="w-full h-full" data-oid="ep0aj:c">
                          <video
                            className="w-full h-full object-cover rounded-xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                            data-oid="xokooqu"
                          >
                            <source
                              src="https://static.videezy.com/system/resources/previews/000/013/613/original/Social_Media_Marketing_1.mp4"
                              type="video/mp4"
                              data-oid="byvfse3"
                            />
                            Your browser does not support the video tag.
                          </video>
                          {/* Overlay with gradient */}
                          <div
                            className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent rounded-xl"
                            data-oid="yzzv6uh"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col justify-center space-y-8"
                  data-oid=".jfwrg6"
                >
                  <div className="space-y-6" data-oid="1kgotg3">
                    <h1
                      className="text-3xl font-bold tracking-tighter sm:text-3xl xl:text-5xl/none"
                      data-oid="liq4q-q"
                    >
                      Transform{" "}
                      <span
                        className="px-2 text-primary text-white bg-purple-600"
                        data-oid="k9nn3:4"
                      >
                        {" "}
                        Landing Page{" "}
                      </span>
                      <div className="h-2.5" data-oid="h6_t60o"></div>
                      to{" "}
                      <span
                        className="px-2 text-primary text-white bg-orange-600"
                        data-oid="32xfv36"
                      >
                        {" "}
                        Short Video{" "}
                      </span>
                    </h1>
                    <p
                      className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400"
                      data-oid="0_g.z0b"
                    >
                      Paste the landing page URL, and effortlessly transform
                      static landing page into captivating short video for
                      social media.
                    </p>
                  </div>
                  <div
                    className="flex flex-col gap-3 sm:flex-row sm:gap-4"
                    data-oid="kk8.bpd"
                  >
                    <div className="relative flex-1" data-oid="3jr-v:i">
                      <Input
                        className="flex-1 text-base sm:min-w-[300px] pr-16"
                        placeholder="https://example.com/landingpage"
                        data-oid="c-_fpw0"
                      />

                      <Button
                        size="lg"
                        className="absolute right-0 top-0 rounded-l-none px-4"
                        asChild
                        data-oid="dokjpyi"
                      >
                        <Link href="/generate" data-oid="l0u_l44">
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
  );
}
