import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
export const metadata: Metadata = {
  title: "LandingVideo - Transform Landing Pages to Videos",
  description:
    "Transform any landing page into captivating short videos for social media",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-oid="6l.15_j">
      <body className="" data-oid="a0naa8d">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          data-oid="0z_gdas"
        >
          <div
            className="relative min-h-screen flex flex-col"
            data-oid="dvqka.4"
          >
            <Navbar data-oid=".1oteqj" />
            <main className="flex-1" data-oid="-se1-_w">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0" data-oid="yggh3rb">
              <div
                className="container mx-auto px-4 md:px-6"
                data-oid="yk5.yy5"
              >
                <div className="mx-auto max-w-7xl" data-oid="ctf6x-7">
                  <div
                    className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4"
                    data-oid="c-qa6a:"
                  >
                    <div className="space-y-4" data-oid="in2h0.8">
                      <h4 className="text-lg font-semibold" data-oid="r1ql.uf">
                        About
                      </h4>
                      <ul className="space-y-2 text-sm" data-oid=":1:8_6r">
                        <li data-oid="3nv-qi7">
                          <Link
                            href="/about"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="1f_f3z-"
                          >
                            About Us
                          </Link>
                        </li>
                        <li data-oid="_2n3.:w">
                          <Link
                            href="/careers"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="agotysl"
                          >
                            Careers
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4" data-oid="koor33f">
                      <h4 className="text-lg font-semibold" data-oid="q77iwbh">
                        Product
                      </h4>
                      <ul className="space-y-2 text-sm" data-oid="bou9:rm">
                        <li data-oid="b3y-0zl">
                          <Link
                            href="/pricing"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="y1z35bs"
                          >
                            Pricing
                          </Link>
                        </li>
                        <li data-oid="29:b5qz">
                          <Link
                            href="/features"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="ju3chwj"
                          >
                            Features
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4" data-oid="gpcouec">
                      <h4 className="text-lg font-semibold" data-oid="p2tv9-y">
                        Resources
                      </h4>
                      <ul className="space-y-2 text-sm" data-oid="lhaf1n1">
                        <li data-oid="54-th85">
                          <Link
                            href="/blog"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="jhuve.9"
                          >
                            Blog
                          </Link>
                        </li>
                        <li data-oid="t9dwnfb">
                          <Link
                            href="/documentation"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="0z78y5-"
                          >
                            Documentation
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4" data-oid="al02b-:">
                      <h4 className="text-lg font-semibold" data-oid="981642r">
                        Legal
                      </h4>
                      <ul className="space-y-2 text-sm" data-oid="_qn4d.7">
                        <li data-oid="0murk3n">
                          <Link
                            href="/privacy"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid=":j7b9__"
                          >
                            Privacy
                          </Link>
                        </li>
                        <li data-oid="c1v8t2q">
                          <Link
                            href="/terms"
                            className="text-muted-foreground hover:text-foreground"
                            data-oid="gvnoqu:"
                          >
                            Terms
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground"
                    data-oid="u-4bn76"
                  >
                    © {new Date().getFullYear()} LandingVideo. All rights
                    reserved.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
