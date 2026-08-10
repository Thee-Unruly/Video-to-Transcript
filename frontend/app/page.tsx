// frontend/app/page.tsx
'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { VideoUploader } from '@/components/VideoUploader';
import { LibraryView } from '@/components/LibraryView';
import { SemanticSearch } from '@/components/SemanticSearch';
import { TranscriptModal } from '@/components/TranscriptModal';
import { Job } from '@/lib/api';
import { Sparkles, Video, Search, Library, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'search'>('upload');
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>('');

  const handleOpenTranscript = (transcriptId: string, filename: string) => {
    setSelectedTranscriptId(transcriptId);
    setSelectedFilename(filename);
  };

  const handleJobCompleted = (job: Job) => {
    if (job.transcript_id) {
      setSelectedTranscriptId(job.transcript_id);
      setSelectedFilename(job.filename);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Pipeline: FFmpeg → Whisper → Groq Llama 3.3 → pgvector</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Transform Videos into{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
                Searchable Knowledge
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Upload video files, run automated Whisper transcription & Groq LLM cleaning, and perform vector similarity searches across your video transcript library.
            </p>
          </div>

          {/* Tab Views */}
          {activeTab === 'upload' && (
            <VideoUploader onJobCompleted={handleJobCompleted} />
          )}

          {activeTab === 'library' && (
            <LibraryView onSelectTranscript={handleOpenTranscript} />
          )}

          {activeTab === 'search' && (
            <SemanticSearch onSelectTranscript={handleOpenTranscript} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Video2Transcript</span>
            <span>• Powered by FastAPI, Celery, Whisper, Groq & PostgreSQL pgvector</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI: http://localhost:8000</span>
            <span>Frontend: http://localhost:3000</span>
          </div>
        </div>
      </footer>

      {/* Transcript Detail Modal */}
      <TranscriptModal
        transcriptId={selectedTranscriptId}
        filename={selectedFilename}
        onClose={() => setSelectedTranscriptId(null)}
      />
    </div>
  );
}
