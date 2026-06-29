# video-to-transcript

A pipeline that converts video files to searchable, vectorized transcripts — with a clean web UI to manage the whole process.

---

## What it does

1. **Upload a video** — any common format (mp4, mov, avi, mkv)
2. **Extract audio** — FFmpeg strips audio to 16kHz mono WAV
3. **Transcribe** — OpenAI Whisper runs locally, returns text + timestamps
4. **Clean** — Claude (claude-sonnet-4-6) fixes punctuation, removes filler words
5. **Vectorize** — chunks are embedded with `all-MiniLM-L6-v2` (384-dim)
6. **Store** — transcript + embeddings saved to PostgreSQL with pgvector
7. **Search** — semantic similarity search across all transcripts

---

## Stack

| Layer | Tech |
|---|---|
| Backend API | FastAPI |
| Task queue | Celery + Redis |
| Transcription | OpenAI Whisper (local) |
| Transcript cleaning | Anthropic Claude API |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Database | PostgreSQL + pgvector |
| Frontend | Next.js (App Router) |
| Containerization | Docker Compose |

---

## Project Structure

```
video-to-transcript/
├── backend/
│   ├── main.py               # FastAPI app + endpoints
│   ├── tasks.py              # Celery pipeline tasks
│   ├── worker.py             # Celery app init
│   ├── pipeline/
│   │   ├── extractor.py      # video → audio (FFmpeg)
│   │   ├── transcriber.py    # audio → transcript (Whisper)
│   │   ├── cleaner.py        # raw → clean text (Claude)
│   │   └── embedder.py       # text → vectors + chunking
│   └── db/
│       ├── connection.py     # psycopg2 helpers
│       └── schema.sql        # table definitions
├── frontend/                 # Next.js app (coming soon)
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Python 3.10+
- FFmpeg installed on your system
  - Mac: `brew install ffmpeg`
  - Ubuntu: `sudo apt install ffmpeg`
  - Windows: [ffmpeg.org](https://ffmpeg.org/download.html) → add to PATH
- Anthropic API key

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd video-to-transcript
cp .env.example .env
# fill in your ANTHROPIC_API_KEY in .env
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Run database migrations

```bash
docker exec -i <postgres-container-name> \
  psql -U postgres -d transcripts < backend/db/schema.sql
```

### 4. Set up Python environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install fastapi uvicorn celery redis \
  ffmpeg-python openai-whisper \
  psycopg2-binary pgvector \
  sentence-transformers anthropic \
  python-multipart aiofiles python-dotenv
```

### 5. Run the backend

```bash
# Terminal 1 — API
uvicorn main:app --reload --port 8000

# Terminal 2 — Celery worker
celery -A worker worker --loglevel=info
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a video, starts pipeline |
| `GET` | `/jobs/{job_id}` | Poll job status |
| `GET` | `/library` | List all completed jobs |
| `GET` | `/transcripts/{id}` | Get full transcript |
| `POST` | `/search` | Semantic search across chunks |

### Job statuses

`pending` → `extracting` → `transcribing` → `cleaning` → `embedding` → `done` / `failed`

### Search example

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "what did they say about pricing", "limit": 5}'
```

---

## Environment Variables

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=transcripts
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
REDIS_URL=redis://localhost:6379/0
ANTHROPIC_API_KEY=your_key_here
UPLOAD_DIR=./uploads
```

---

## Database Schema

Three tables:

- **`jobs`** — tracks every upload and its pipeline status
- **`transcripts`** — stores raw and cleaned transcript text per job
- **`transcript_chunks`** — stores chunked text with Whisper timestamps and 384-dim embeddings

Similarity search uses `ivfflat` index (cosine distance).

---

## Roadmap

- [x] Video → audio extraction
- [x] Whisper transcription (with timestamps)
- [x] LLM transcript cleaning
- [x] Chunking + vector embeddings
- [x] PostgreSQL + pgvector storage
- [x] REST API
- [ ] Next.js frontend
- [ ] Job progress UI with live polling
- [ ] Transcript viewer
- [ ] Semantic search UI
- [ ] Speaker diarization
- [ ] Export to SRT / PDF

---

## License

MIT