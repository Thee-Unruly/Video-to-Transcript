// frontend/components/Navbar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Video, Search, Library, Upload, HelpCircle, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'library' | 'search' | 'guide';
  setActiveTab: (tab: 'upload' | 'library' | 'search' | 'guide') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isBackendAlive, setIsBackendAlive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/library');
        setIsBackendAlive(res.ok);
      } catch {
        setIsBackendAlive(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100">
            <Video className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">Video2Transcript</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              Groq Llama 3.3
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Architecture Guide</span>
          </button>
        </nav>

        {/* API Health Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className={`w-2 h-2 rounded-full ${isBackendAlive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span>{isBackendAlive === null ? 'Connecting...' : isBackendAlive ? 'API Online' : 'API Offline'}</span>
        </div>
      </div>
    </header>
  );
};
