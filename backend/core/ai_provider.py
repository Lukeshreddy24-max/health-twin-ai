import json
from core.config import settings

def call_ai(prompt: str) -> str:
    provider = settings.AI_PROVIDER.lower()

    if provider == "groq":
        from groq import Groq
        import os as _os
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )
        return completion.choices[0].message.content
    # ── Gemini ──────────────────────────────────────────
    if provider == "gemini":
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text

    elif provider == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text

    elif provider == "ollama":
        import httpx
        response = httpx.post(
            f"{settings.OLLAMA_URL}/api/generate",
            json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=60
        )
        return response.json()["response"]

    else:
        raise ValueError(f"Unknown AI_PROVIDER: {provider}")
