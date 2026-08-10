// frontend/components/SemanticSearch.tsx
'use client';

import React, { useState } from 'react';
import { Search, Clock, Loader2, Zap, AlertCircle } from 'lucide-react';
import { searchTranscripts, SearchResult } from '@/lib/api';
import { formatTime } from '@/lib/utils';

interface Props {
  onSelectTranscript?: (transcriptId: string, filename: string) => void;
}

const EXAMPLE_QUERIES = [
  'What was discussed about pricing or costs?',
  'Key technical architectural decisions',
  'Next action items and roadmap steps',
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
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <div className="card-dark rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-zinc-100">Vector Similarity Search</h2>
          <p className="text-xs text-zinc-400">
            Query indexed transcript chunks using 384-dimensional dense vector embeddings (`all-MiniLM-L6-v2`).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search concepts across your videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-zinc-500">Examples:</span>
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(example);
                  handleSearch(example);
                }}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800 transition-all"
              >
                "{example}"
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results !== null && (
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            <h3 className="text-xs font-mono text-zinc-400">
              Matches Found: {results.length}
            </h3>

            {results.length === 0 ? (
              <div className="py-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 p-4">
                <p className="text-zinc-400 text-xs">No vector matches found for your query.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {results.map((item, idx) => {
                  const matchPercentage = Math.round(item.score * 100);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                          </span>
                          <span className="text-zinc-600">• Job: {item.job_id}</span>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          {matchPercentage}% Match
                        </span>
                      </div>

                      <p className="text-zinc-200 text-xs leading-relaxed font-sans bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/50">
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
