// frontend/app/page.tsx
'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { VideoUploader } from '@/components/VideoUploader';
import { LibraryView } from '@/components/LibraryView';
import { SemanticSearch } from '@/components/SemanticSearch';
import { TranscriptModal } from '@/components/TranscriptModal';
import { PipelineExplainer } from '@/components/PipelineExplainer';
import { Job } from '@/lib/api';
import { Video, Search, Library, HelpCircle, Terminal } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'search' | 'guide'>('upload');
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
    <div className="min-h-screen flex flex-col justify-between bg-[#09090b]">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Minimalist Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-100 tracking-tight">
              Video Transcript & Semantic Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Automated video pipeline powered by FFmpeg audio extraction, OpenAI Whisper ASR, Groq Llama 3.3 LLM cleaning, and PostgreSQL pgvector embeddings.
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

          {activeTab === 'guide' && (
            <PipelineExplainer />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#09090b] py-4 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-300">Video2Transcript</span>
            <span>• FFmpeg / Whisper / Groq / pgvector</span>
          </div>
          <div className="flex items-center gap-3">
            <span>API: localhost:8000</span>
            <span>UI: localhost:3000</span>
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
