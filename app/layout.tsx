import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LandingVideo - Transform Landing Pages to Videos',
  description: 'Transform any landing page into captivating short videos for social media',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                  <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">About</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link href="/about" className="text-muted-foreground hover:text-foreground">
                            About Us
                          </Link>
                        </li>
                        <li>
                          <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                            Careers
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Product</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                            Pricing
                          </Link>
                        </li>
                        <li>
                          <Link href="/features" className="text-muted-foreground hover:text-foreground">
                            Features
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Resources</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                            Blog
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation" className="text-muted-foreground hover:text-foreground">
                            Documentation
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Legal</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                            Privacy
                          </Link>
                        </li>
                        <li>
                          <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                            Terms
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} LandingVideo. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}