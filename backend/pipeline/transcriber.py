# backend/pipeline/transcriber.py
import whisper

_model = None

def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model

def transcribe(audio_path: str) -> dict:
    model = get_model()
    result = model.transcribe(audio_path)
    return {
        "text": result["text"],
        "segments": result["segments"]  # [{start, end, text}]
    }