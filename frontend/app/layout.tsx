// frontend/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video2Transcript - Vectorized Video Transcripts & Semantic Search",
  description: "AI-powered video processing pipeline with OpenAI Whisper, Groq Llama 3.3, and PostgreSQL pgvector semantic search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen relative selection:bg-indigo-500 selection:text-white">
        {/* Ambient Glowing Background Orbs */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        {children}
      </body>
    </html>
  );
}
