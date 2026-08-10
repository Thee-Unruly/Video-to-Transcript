// frontend/components/LibraryView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getLibrary, Job } from '@/lib/api';
import { JobStatusBadge } from './JobStatusBadge';
import { formatDate } from '@/lib/utils';
import { RefreshCw, FileText, Film, Search, AlertCircle } from 'lucide-react';

interface Props {
  onSelectTranscript: (transcriptId: string, filename: string) => void;
}

export const LibraryView: React.FC<Props> = ({ onSelectTranscript }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLibrary();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcript library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
    job.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <div className="card-dark rounded-2xl p-6 space-y-5">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-zinc-400" />
              <span>Transcript Library</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Manage and inspect all processed video transcripts</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter transcripts..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all font-mono"
              />
            </div>

            <button
              onClick={fetchLibrary}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-xs font-medium">Loading library items...</p>
          </div>
        ) : error ? (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 p-6">
            <p className="text-zinc-400 text-xs">No video transcripts found in library.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400 text-[11px] uppercase font-mono bg-zinc-900/60">
                  <th className="py-3 px-4">Video File</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                          <Film className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="truncate max-w-xs">{job.filename}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{job.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <JobStatusBadge status={job.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                      {formatDate(job.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {job.transcript_id ? (
                        <button
                          onClick={() => onSelectTranscript(job.transcript_id!, job.filename)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Transcript</span>
                        </button>
                      ) : (
                        <span className="text-zinc-500 text-xs font-mono">In Pipeline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
