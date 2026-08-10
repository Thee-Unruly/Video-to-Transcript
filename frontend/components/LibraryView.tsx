// frontend/components/LibraryView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getLibrary, Job } from '@/lib/api';
import { JobStatusBadge } from './JobStatusBadge';
import { formatDate } from '@/lib/utils';
import { RefreshCw, FileText, Film, Search, ArrowUpDown, AlertCircle } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-400" />
              <span>Transcript Library</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage and inspect all processed video transcripts</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filter Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            <button
              onClick={fetchLibrary}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Table / List */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Loading library items...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center bg-slate-950/40 rounded-2xl border border-slate-800 p-8">
            <p className="text-slate-400 text-sm">No video transcripts found in library.</p>
            <p className="text-slate-600 text-xs mt-1">Upload a video to start processing!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold bg-slate-950/80">
                  <th className="py-3.5 px-4">Video File</th>
                  <th className="py-3.5 px-4">Job Status</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800 text-indigo-300">
                          <Film className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="truncate max-w-xs">{job.filename}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{job.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <JobStatusBadge status={job.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {formatDate(job.created_at)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {job.transcript_id ? (
                        <button
                          onClick={() => onSelectTranscript(job.transcript_id!, job.filename)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-violet-500/20 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Transcript</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs italic">In Pipeline</span>
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
