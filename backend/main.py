# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db.connection import run_query
from pipeline.embedder import embed
from tasks import run_pipeline
import os, uuid, shutil
from dotenv import load_dotenv

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    dest = f"{UPLOAD_DIR}/{job_id}.{ext}"

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    run_query(
        "INSERT INTO jobs (id, filename, status) VALUES (%s, %s, 'pending')",
        (job_id, file.filename)
    )
    run_pipeline.delay(job_id, dest)
    return {"job_id": job_id}

@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    rows = run_query("SELECT * FROM jobs WHERE id=%s", (job_id,), fetch=True)
    if not rows:
        raise HTTPException(404, "Job not found")
    return dict(rows[0])

@app.get("/library")
def library():
    rows = run_query(
        "SELECT j.id, j.filename, j.status, j.created_at, t.id as transcript_id "
        "FROM jobs j LEFT JOIN transcripts t ON t.job_id = j.id "
        "ORDER BY j.created_at DESC",
        fetch=True
    )
    return [dict(r) for r in rows]

@app.get("/transcripts/{transcript_id}")
def get_transcript(transcript_id: str):
    rows = run_query(
        "SELECT * FROM transcripts WHERE id=%s", (transcript_id,), fetch=True
    )
    if not rows:
        raise HTTPException(404, "Not found")
    return dict(rows[0])

@app.post("/search")
def search(body: dict):
    query = body.get("query")
    limit = body.get("limit", 5)
    vec = embed([query])[0]
    rows = run_query(
        """SELECT c.chunk_text, c.start_time, c.end_time, c.job_id,
                  1 - (c.embedding <=> %s::vector) AS score
           FROM transcript_chunks c
           ORDER BY c.embedding <=> %s::vector
           LIMIT %s""",
        (str(vec), str(vec), limit),
        fetch=True
    )
    return [dict(r) for r in rows]