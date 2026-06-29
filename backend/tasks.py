# backend/tasks.py
from worker import celery_app
from pipeline.extractor import extract_audio
from pipeline.transcriber import transcribe
from pipeline.cleaner import clean_transcript
from pipeline.embedder import chunk_segments, embed
from db.connection import run_query
import os, uuid

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

def set_status(job_id, status, error=None):
    run_query(
        "UPDATE jobs SET status=%s, error=%s, updated_at=now() WHERE id=%s",
        (status, error, job_id)
    )

@celery_app.task
def run_pipeline(job_id: str, video_path: str):
    try:
        # 1. Extract audio
        set_status(job_id, "extracting")
        audio_path = extract_audio(video_path, f"{UPLOAD_DIR}/audio")

        # 2. Transcribe
        set_status(job_id, "transcribing")
        result = transcribe(audio_path)
        raw_text = result["text"]
        segments = result["segments"]

        # 3. Clean
        set_status(job_id, "cleaning")
        clean_text = clean_transcript(raw_text)

        # 4. Store transcript
        transcript_id = str(uuid.uuid4())
        run_query(
            "INSERT INTO transcripts (id, job_id, raw_text, clean_text) VALUES (%s, %s, %s, %s)",
            (transcript_id, job_id, raw_text, clean_text)
        )

        # 5. Chunk + embed
        set_status(job_id, "embedding")
        chunks = chunk_segments(segments)
        texts = [c["text"] for c in chunks]
        embeddings = embed(texts)

        for chunk, vec in zip(chunks, embeddings):
            run_query(
                """INSERT INTO transcript_chunks
                   (id, transcript_id, job_id, chunk_text, start_time, end_time, embedding)
                   VALUES (%s, %s, %s, %s, %s, %s, %s::vector)""",
                (str(uuid.uuid4()), transcript_id, job_id,
                 chunk["text"], chunk["start"], chunk["end"], str(vec))
            )

        set_status(job_id, "done")

    except Exception as e:
        set_status(job_id, "failed", str(e))
        raise