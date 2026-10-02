import os
import requests

try:
    from groq import Groq
except ImportError:
    Groq = None

class LLMGenerator:
    def __init__(self):
        # Cloud LLM (Groq) for 100% free cloud deployment without high RAM
        raw_key = os.getenv("GROQ_API_KEY", "")
        # Clean any quotes or accidental spaces from environment variable input
        self.groq_api_key = raw_key.strip().strip('"').strip("'")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip()

        # Local Ollama configuration
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "phi3:mini")

        self.groq_client = None
        if self.groq_api_key and Groq is not None:
            self.groq_client = Groq(api_key=self.groq_api_key)

    def generate(self, prompt: str) -> str:
        # Option 1: Use official Groq SDK if key is provided
        if self.groq_client:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.groq_model,
                temperature=0.2,
            )
            return chat_completion.choices[0].message.content.strip()

        # Option 2: Fallback to requests if Groq key exists without SDK
        if self.groq_api_key:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.groq_model,
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
