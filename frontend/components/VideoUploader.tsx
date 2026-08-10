// frontend/components/VideoUploader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileVideo, AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Film } from 'lucide-react';
import { uploadVideo, getJobStatus, Job } from '@/lib/api';
import { JobStatusBadge } from './JobStatusBadge';

interface Props {
  onJobCompleted?: (job: Job) => void;
}

const STAGES: { id: Job['status']; label: string; humanDesc: string }[] = [
  { id: 'pending', label: 'Queued', humanDesc: 'Receiving file and initializing pipeline' },
  { id: 'extracting', label: 'Audio Extract', humanDesc: 'FFmpeg extracting 16kHz mono audio' },
  { id: 'transcribing', label: 'Whisper ASR', humanDesc: 'OpenAI Whisper generating transcript timestamps' },
  { id: 'cleaning', label: 'Groq LLM', humanDesc: 'Groq Llama 3.3 cleaning punctuation & fillers' },
  { id: 'embedding', label: 'Vector Index', humanDesc: 'Embedding 384-dim chunks into pgvector' },
  { id: 'done', label: 'Completed', humanDesc: 'Transcript processed & ready for search' },
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
  const progressPercent = currentJob
    ? Math.min(100, Math.round(((currentStageIdx + 1) / STAGES.length) * 100))
    : 0;

  const activeStageConfig = STAGES[currentStageIdx] || STAGES[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Box */}
      <div className="card-dark rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-zinc-100">Upload Video File</h2>
          <p className="text-xs text-zinc-400">
            Upload MP4, MOV, AVI, or MKV to process through FFmpeg, Whisper, Groq Llama 3.3, and pgvector.
          </p>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
            file
              ? 'border-zinc-500 bg-zinc-900/80'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
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
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-200 font-medium text-sm">Click or drag video file here</p>
                <p className="text-zinc-500 text-xs mt-0.5">MP4, MOV, AVI, MKV up to 500MB</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-zinc-200 font-medium text-xs truncate max-w-xs">{file.name}</p>
                  <p className="text-zinc-500 text-[11px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-all"
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
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Execution Tracker */}
      {currentJob && (
        <div className="card-dark rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Pipeline Execution Progress</h3>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Job ID: {currentJob.id}</p>
            </div>
            <JobStatusBadge status={currentJob.status} size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-medium">{activeStageConfig.humanDesc}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-zinc-100 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIdx || currentJob.status === 'done';
              const isCurrent = idx === currentStageIdx && currentJob.status !== 'done' && currentJob.status !== 'failed';
              const isFailed = currentJob.status === 'failed' && idx === currentStageIdx;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-zinc-900/80 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-semibold'
                      : isFailed
                      ? 'bg-red-950/60 border-red-500/40 text-red-300'
                      : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-600'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-zinc-200 animate-spin" />
                    ) : isFailed ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">{idx + 1}</span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium leading-tight">{stage.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
