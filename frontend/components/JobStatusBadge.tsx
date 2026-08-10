// frontend/components/JobStatusBadge.tsx
import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, FileAudio, Mic, Sparkles, Brain } from 'lucide-react';
import { Job } from '@/lib/api';

interface Props {
  status: Job['status'];
  size?: 'sm' | 'md' | 'lg';
}

export const JobStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const configs = {
    pending: {
      label: 'Queued',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: Loader2,
      spin: true,
    },
    extracting: {
      label: 'Extracting Audio',
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: FileAudio,
      spin: false,
    },
    transcribing: {
      label: 'Whisper Transcribing',
      bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      icon: Mic,
      spin: false,
    },
    cleaning: {
      label: 'Groq LLM Cleaning',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: Sparkles,
      spin: false,
    },
    embedding: {
      label: 'Vectorizing Chunks',
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      icon: Brain,
      spin: false,
    },
    done: {
      label: 'Completed',
      bg: 'bg-green-500/10 border-green-500/30 text-green-400',
      icon: CheckCircle2,
      spin: false,
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: AlertCircle,
      spin: false,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-semibold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all ${config.bg} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} ${config.spin ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};
