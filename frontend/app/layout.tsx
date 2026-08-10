// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Video2Transcript • Video Search & Pipeline",
  description: "FastAPI, OpenAI Whisper, Groq Llama 3.3, and PostgreSQL pgvector video transcript intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="font-sans bg-[#09090b] text-[#fafafa] antialiased min-h-screen relative selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
