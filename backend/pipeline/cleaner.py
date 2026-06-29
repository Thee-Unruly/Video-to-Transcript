# backend/pipeline/cleaner.py
import anthropic, os

def clean_transcript(raw_text: str) -> str:
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": (
                "Clean this transcript. Fix punctuation, remove filler words "
                "(um, uh, like), fix run-on sentences. Return only the cleaned text.\n\n"
                + raw_text
            )
        }]
    )
    return msg.content[0].text