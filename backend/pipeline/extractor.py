# backend/pipeline/extractor.py
import ffmpeg, os, uuid

def extract_audio(video_path: str, output_dir: str) -> str:
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, f"{uuid.uuid4()}.wav")
    (
        ffmpeg
        .input(video_path)
        .output(out_path, ac=1, ar=16000, format='wav')
        .run(overwrite_output=True, quiet=True)
    )
    return out_path