# backend/pipeline/cleaner.py
from groq import Groq
import os

def clean_transcript(raw_text: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": (
                "Clean this transcript. Fix punctuation, remove filler words "
                "(um, uh, like), fix run-on sentences. Return only the cleaned text.\n\n"
                + raw_text
            )
        }],
        temperature=0.2,
        max_tokens=4096,
    )
    return completion.choices[0].message.content