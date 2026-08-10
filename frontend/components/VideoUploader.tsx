// frontend/components/VideoUploader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileVideo, AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Sparkles, Film } from 'lucide-react';
import { uploadVideo, getJobStatus, Job } from '@/lib/api';
import { JobStatusBadge } from './JobStatusBadge';

interface Props {
  onJobCompleted?: (job: Job) => void;
}

const STAGES: { id: Job['status']; label: string; desc: string }[] = [
  { id: 'pending', label: 'Upload & Queue', desc: 'Receiving video file' },
  { id: 'extracting', label: 'FFmpeg Audio', desc: 'Stripping 16kHz mono WAV' },
  { id: 'transcribing', label: 'OpenAI Whisper', desc: 'Generating raw timestamps' },
  { id: 'cleaning', label: 'Groq Llama 3.3', desc: 'Refining grammar & fillers' },
  { id: 'embedding', label: 'Vectorization', desc: 'Embedding 384-dim chunks' },
  { id: 'done', label: 'Ready', desc: 'Indexed in PostgreSQL' },
];

export const VideoUploader: React.FC<Props> = ({ onJobCompleted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/') || /\.(mp4|mov|avi|mkv)$/i.test(droppedFile.name)) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a valid video file (.mp4, .mov, .avi, .mkv).');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const res = await uploadVideo(file);

      const initialJob: Job = {
        id: res.job_id,
        filename: file.name,
        status: 'pending',
      };
      setCurrentJob(initialJob);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
      setIsUploading(false);
    }
  };

  // Poll job status until done or failed
  useEffect(() => {
    if (!currentJob || currentJob.status === 'done' || currentJob.status === 'failed') {
      if (currentJob?.status === 'done') {
        setIsUploading(false);
        if (onJobCompleted) onJobCompleted(currentJob);
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await getJobStatus(currentJob.id);
        setCurrentJob(updated);

        if (updated.status === 'done' || updated.status === 'failed') {
          setIsUploading(false);
          if (updated.status === 'done' && onJobCompleted) {
            onJobCompleted(updated);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJob, onJobCompleted]);

  const getStageIndex = (status: Job['status']) => {
    const idx = STAGES.findIndex((s) => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIdx = currentJob ? getStageIndex(currentJob.status) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* File Upload Box */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-center gap-2">
            <span>Upload Video File</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload any video (.mp4, .mov, .avi, .mkv) to extract, transcribe with Whisper, refine with Groq Llama 3.3, and index for semantic search.
          </p>
        </div>

        {/* Drag & Drop Target */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
            file
              ? 'border-indigo-500/50 bg-indigo-500/5'
              : 'border-slate-700/80 hover:border-violet-500/50 hover:bg-slate-800/40 bg-slate-950/40'
          }`}
        >
          <input
            type="file"
            accept="video/*,.mp4,.mov,.avi,.mkv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          {!file ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/80 text-violet-400 border border-slate-700 group-hover:scale-105 group-hover:text-indigo-300 transition-all shadow-lg">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-200 font-semibold text-base">Drag & drop your video file here</p>
                <p className="text-slate-500 text-xs mt-1">or click to browse your file system</p>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                <span>MP4 • MOV • AVI • MKV</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <FileVideo className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-slate-200 font-medium text-sm truncate max-w-xs">{file.name}</p>
                  <p className="text-slate-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setCurrentJob(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                  >
                    Change
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Pipeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Live Pipeline Processing Tracker */}
      {currentJob && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-200">Pipeline Execution Progress</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Job ID: {currentJob.id}</p>
            </div>
            <JobStatusBadge status={currentJob.status} size="lg" />
          </div>

          {/* Stepper Display */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIdx || currentJob.status === 'done';
              const isCurrent = idx === currentStageIdx && currentJob.status !== 'done' && currentJob.status !== 'failed';
              const isFailed = currentJob.status === 'failed' && idx === currentStageIdx;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/30'
                      : isFailed
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                    ) : isFailed ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{stage.label}</p>
                    <p className="text-[10px] opacity-70 mt-1">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {currentJob.error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <p className="font-semibold">Pipeline Error:</p>
              <p className="font-mono mt-1">{currentJob.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
