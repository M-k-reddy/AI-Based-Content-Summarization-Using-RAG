import os
import requests

class LLMGenerator:
    def __init__(self):
        # Cloud LLM (Groq) for 100% free cloud deployment without high RAM
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

        # Local Ollama configuration
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "phi3:mini")

    def generate(self, prompt: str) -> str:
        # Option 1: Use Groq API if key is provided (ideal for free hosting on Render/Railway)
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

        # Option 2: Use Ollama (local model or self-hosted Ollama server)
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(self.ollama_url, json=payload, timeout=120)
        response.raise_for_status()

        return response.json()["response"].strip()

