// frontend/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Job {
  id: string;
  filename: string;
  status: 'pending' | 'extracting' | 'transcribing' | 'cleaning' | 'embedding' | 'done' | 'failed';
  error?: string | null;
  created_at?: string;
  updated_at?: string;
  transcript_id?: string | null;
}

export interface Transcript {
  id: string;
  job_id: string;
  raw_text: string;
  clean_text: string;
  created_at?: string;
}

export interface SearchResult {
  chunk_text: string;
  start_time: number;
  end_time: number;
  job_id: string;
  score: number;
  filename?: string;
}

export async function uploadVideo(file: File): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed: ${response.statusText} (${errText})`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch job status`);
  }
  return response.json();
}

export async function getLibrary(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/library`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transcript library`);
  }
  return response.json();
}

export async function getTranscript(transcriptId: string): Promise<Transcript> {
  const response = await fetch(`${API_BASE_URL}/transcripts/${transcriptId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transcript details`);
  }
  return response.json();
}

export async function searchTranscripts(query: string, limit: number = 5): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  return response.json();
}
