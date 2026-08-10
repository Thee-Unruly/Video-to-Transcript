// frontend/components/PipelineExplainer.tsx
'use client';

import React, { useState } from 'react';
import { Film, Volume2, Mic, Sparkles, Brain, CheckCircle2, ArrowRight } from 'lucide-react';

interface StageDetail {
  id: string;
  stepNum: string;
  title: string;
  techTag: string;
  shortDesc: string;
  icon: any;
  whatItDoes: string;
  whyItMatters: string;
  analogy: string;
}

const STAGE_DETAILS: StageDetail[] = [
  {
    id: 'video',
    stepNum: '01',
    title: 'Video Ingestion',
    techTag: 'FastAPI + Multipart Upload',
    shortDesc: 'Receives MP4, MOV, AVI, or MKV videos',
    icon: Film,
    whatItDoes: 'Accepts video files, checks integrity, saves to workspace storage, and creates a tracked pipeline task.',
    whyItMatters: 'Processes any raw video directly without requiring manual re-encoding or pre-processing.',
    analogy: 'Like dropping off a physical package at a shipping distribution desk.',
  },
  {
    id: 'audio',
    stepNum: '02',
    title: 'Audio Extraction',
    techTag: 'FFmpeg Engine (16kHz Mono)',
    shortDesc: 'Strips video into clean audio stream',
    icon: Volume2,
    whatItDoes: 'Strips out all video frames and exports only the spoken vocal audio into a 16kHz mono WAV format.',
    whyItMatters: 'Reduces data payload size by ~90%, allowing speech recognition models to run at maximum speed.',
    analogy: 'Like extracting the vocal audio track from a full movie file.',
  },
  {
    id: 'whisper',
    stepNum: '03',
    title: 'Speech Recognition',
    techTag: 'OpenAI Whisper Model',
    shortDesc: 'Converts voice to text with timestamps',
    icon: Mic,
    whatItDoes: 'Whisper listens to acoustic speech patterns and transcribes every spoken sentence along with exact millisecond timestamps.',
    whyItMatters: 'Provides precise time markers (e.g. 01:24) so you can jump to exact moments in the video.',
    analogy: 'Like a court stenographer typing down word-for-word transcriptions during a trial.',
  },
  {
    id: 'groq',
    stepNum: '04',
    title: 'AI Transcript Refinement',
    techTag: 'Groq Llama 3.3 70B Versatile',
    shortDesc: 'Removes "ums", "ahs", & formats text',
    icon: Sparkles,
    whatItDoes: 'Groq Llama 3.3 cleans up stuttered words, filler sounds ("um", "like", "uh"), fixes grammar, and formats readable paragraphs.',
    whyItMatters: 'Turns messy spoken audio into polished, publication-grade text.',
    analogy: 'Like a chief editor reviewing a draft to polish punctuation and remove awkward stuttering.',
  },
  {
    id: 'vector',
    stepNum: '05',
    title: 'Vector Embedding Index',
    techTag: 'PostgreSQL + pgvector (MiniLM)',
    shortDesc: '384-dimensional vector similarity index',
    icon: Brain,
    whatItDoes: 'Chunks text into sentence blocks and converts them into 384-dimensional vector points stored in PostgreSQL with pgvector.',
    whyItMatters: 'Enables semantic search: searching for "costs" finds sections talking about "pricing" or "budget".',
    analogy: 'Like organizing books by subject matter on library shelves so related topics sit next to each other.',
  },
];

export const PipelineExplainer: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageDetail>(STAGE_DETAILS[0]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <div className="card-dark rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
            Architecture & Pipeline Workflow
          </span>
          <h2 className="text-xl font-bold text-zinc-100">How Video-to-Transcript Works</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Click any processing stage below to inspect what happens behind the scenes.
          </p>
        </div>

        {/* Node Flow Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {STAGE_DETAILS.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStage.id === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{stage.stepNum}</span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`} />
                </div>
                <p className="text-xs font-semibold leading-snug">{stage.title}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{stage.techTag}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/60">
                <selectedStage.icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{selectedStage.title}</h3>
                <p className="text-xs text-zinc-400">{selectedStage.shortDesc}</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">
              {selectedStage.techTag}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">What it does</span>
              <p className="text-zinc-300 leading-relaxed">{selectedStage.whatItDoes}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Why it matters</span>
              <p className="text-zinc-300 leading-relaxed">{selectedStage.whyItMatters}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Real-world analogy</span>
              <p className="text-zinc-300 leading-relaxed">{selectedStage.analogy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
