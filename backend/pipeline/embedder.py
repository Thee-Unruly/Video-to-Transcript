# backend/pipeline/embedder.py
from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim
    return _model

def embed(texts: list[str]) -> list[list[float]]:
    model = get_model()
    return model.encode(texts, convert_to_numpy=True).tolist()

def chunk_segments(segments: list[dict], group_size: int = 4) -> list[dict]:
    """Group whisper segments into chunks of ~4 sentences."""
    chunks = []
    for i in range(0, len(segments), group_size):
        group = segments[i:i+group_size]
        chunks.append({
            "text": " ".join(s["text"].strip() for s in group),
            "start": group[0]["start"],
            "end": group[-1]["end"]
        })
    return chunks