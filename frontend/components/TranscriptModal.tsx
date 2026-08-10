// frontend/components/TranscriptModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, FileText, Copy, Check, Download, Loader2 } from 'lucide-react';
import { getTranscript, Transcript } from '@/lib/api';

interface Props {
  transcriptId: string | null;
  filename?: string;
  onClose: () => void;
}

export const TranscriptModal: React.FC<Props> = ({ transcriptId, filename, onClose }) => {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'clean' | 'raw'>('clean');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transcriptId) {
      setTranscript(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTranscript(transcriptId);
        setTranscript(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [transcriptId]);

  if (!transcriptId) return null;

  const currentText = activeView === 'clean' ? transcript?.clean_text : transcript?.raw_text;

  const handleCopy = () => {
    if (currentText) {
      navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!currentText) return;
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'transcript'}_${activeView}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-lg font-bold text-slate-100 truncate max-w-md">
              {filename || 'Transcript Details'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {transcriptId}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveView('clean')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'clean'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Groq Cleaned</span>
              </button>

              <button
                onClick={() => setActiveView('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'raw'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Raw Whisper</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium">Fetching transcript content...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          ) : (
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-6 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {currentText || 'No transcript text available.'}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            {activeView === 'clean' ? '✨ Punctuation & filler words cleaned by Groq Llama 3.3' : '🎙️ Raw Whisper ASR output'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!currentText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!currentText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
