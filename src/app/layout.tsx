import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Movie Scene Generator",
  description: "Generate movie scripts and videos from your prompts using AI",
  keywords: ["AI", "movie", "script", "video generation", "cinema", "scenes"],
  authors: [{ name: "AI Movie Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🎬</span>
                AI Movie Scene Generator
              </h1>
              <p className="text-slate-300 mt-2">
                Transform your ideas into cinematic scripts and videos with AI
              </p>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6 text-center text-slate-400">
              <p>Powered by Claude Sonnet 4 & Veo-3 AI Models</p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}