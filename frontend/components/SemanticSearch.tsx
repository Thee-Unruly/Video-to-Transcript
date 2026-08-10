// frontend/components/SemanticSearch.tsx
'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Clock, FileText, Loader2, Award, Zap, AlertCircle } from 'lucide-react';
import { searchTranscripts, SearchResult } from '@/lib/api';
import { formatTime } from '@/lib/utils';

interface Props {
  onSelectTranscript?: (transcriptId: string, filename: string) => void;
}

const EXAMPLE_QUERIES = [
  'What was discussed about pricing or costs?',
  'Key technical architectural decisions',
  'Next action items and roadmap steps',
  'User feedback and improvements',
];

export const SemanticSearch: React.FC<Props> = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await searchTranscripts(searchQuery);
      setResults(res);
    } catch (err: any) {
      setError(err.message || 'Semantic search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Semantic Vector Search</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Search across indexed video transcript chunks using 384-dimensional dense embeddings (`all-MiniLM-L6-v2`).
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ask anything about the video contents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(example);
                  handleSearch(example);
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-950/60 hover:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-800 transition-all"
              >
                "{example}"
              </button>
            ))}
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results View */}
        {results !== null && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                Found {results.length} relevant transcript chunk(s)
              </h3>
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 p-6">
                <p className="text-slate-400 text-sm">No vector matches found for your query.</p>
                <p className="text-slate-600 text-xs mt-1">Try phrasing your search query differently or uploading more videos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((item, idx) => {
                  const matchPercentage = Math.round(item.score * 100);

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                            Job: {item.job_id}
                          </span>
                        </div>

                        {/* Relevance Score Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{matchPercentage}% Match</span>
                        </div>
                      </div>

                      {/* Snippet text */}
                      <p className="text-slate-200 text-sm leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                        "{item.chunk_text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
