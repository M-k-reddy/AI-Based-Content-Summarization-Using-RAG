import os
import requests

try:
    from groq import Groq
except ImportError:
    Groq = None

class LLMGenerator:
    def __init__(self):
        raw_key = os.getenv("GROQ_API_KEY", "")
        # Clean any quotes or accidental spaces from environment variable input
        self.groq_api_key = raw_key.strip().strip('"').strip("'")
        self.groq_model = os.getenv("GROQ_MODEL", "").strip()

        # Local Ollama configuration
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "phi3:mini")

        self.groq_client = None
        if self.groq_api_key and Groq is not None:
            try:
                self.groq_client = Groq(api_key=self.groq_api_key)
            except Exception as e:
                print("Failed to init Groq client:", e)

    def _get_active_groq_model(self) -> str:
        if self.groq_model:
            return self.groq_model

        # Auto-detect available models from Groq API so it never 404s
        fallback_preference = [
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-20b",
            "qwen/qwen3.6-27b",
            "llama-3.1-8b-instant",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]

        if self.groq_client:
            try:
                models_data = self.groq_client.models.list().data
                available = [
                    m.id for m in models_data 
                    if not m.id.startswith("whisper") and not m.id.startswith("distil-whisper")
                ]
                for pref in fallback_preference:
                    if pref in available:
                        self.groq_model = pref
                        return pref
                if available:
                    self.groq_model = available[0]
                    return available[0]
            except Exception as e:
                print("Could not query Groq models list:", e)

        return "llama-3.3-70b-versatile"

    def generate(self, prompt: str) -> str:
        # Option 1: Use official Groq SDK if key is provided
        if self.groq_client:
            model = self._get_active_groq_model()
            try:
                chat_completion = self.groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=model,
                    temperature=0.2,
                )
                return chat_completion.choices[0].message.content.strip()
            except Exception as e:
                # If the chosen model hits any issue, fallback to llama-3.3-70b-versatile
                try:
                    chat_completion = self.groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model="llama-3.3-70b-versatile",
                        temperature=0.2,
                    )
                    return chat_completion.choices[0].message.content.strip()
                except Exception:
                    raise e

        # Option 2: Fallback to requests if Groq key exists without SDK
        if self.groq_api_key:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                },
                timeout=60
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()

        # Option 3: Use Ollama (local model or self-hosted Ollama server)
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(self.ollama_url, json=payload, timeout=120)
        response.raise_for_status()

        return response.json()["response"].strip()
