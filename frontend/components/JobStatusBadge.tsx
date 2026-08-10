// frontend/components/JobStatusBadge.tsx
import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, FileAudio, Mic, Sparkles, Brain } from 'lucide-react';
import { Job } from '@/lib/api';

interface Props {
  status: Job['status'];
  size?: 'sm' | 'md';
}

export const JobStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const configs = {
    pending: {
      label: 'Queued',
      bg: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60',
      icon: Loader2,
      spin: true,
    },
    extracting: {
      label: 'Extracting Audio',
      bg: 'bg-zinc-800/80 text-blue-300 border-blue-500/30',
      icon: FileAudio,
      spin: false,
    },
    transcribing: {
      label: 'Whisper Transcribing',
      bg: 'bg-zinc-800/80 text-purple-300 border-purple-500/30',
      icon: Mic,
      spin: false,
    },
    cleaning: {
      label: 'Groq LLM Clean',
      bg: 'bg-zinc-800/80 text-amber-300 border-amber-500/30',
      icon: Sparkles,
      spin: false,
    },
    embedding: {
      label: 'Vector Embedding',
      bg: 'bg-zinc-800/80 text-cyan-300 border-cyan-500/30',
      icon: Brain,
      spin: false,
    },
    done: {
      label: 'Completed',
      bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      spin: false,
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-950/60 text-red-300 border-red-500/30',
      icon: AlertCircle,
      spin: false,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-medium transition-all ${config.bg} ${sizeClasses}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.spin ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};
