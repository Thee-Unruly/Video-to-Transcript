-- backend/db/schema.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    raw_text TEXT,
    clean_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transcript_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    start_time FLOAT,
    end_time FLOAT,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON transcript_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);