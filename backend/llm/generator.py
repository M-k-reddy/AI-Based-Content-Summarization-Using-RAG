import os
import requests

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from groq import Groq
except ImportError:
    Groq = None


class LLMGenerator:
    """
    Universal LLM Generator supporting any provider:
    - Ollama (Local or Remote, with optional OLLAMA_API_KEY)
    - Groq (GROQ_API_KEY)
    - OpenAI (OPENAI_API_KEY)
    - DeepSeek (DEEPSEEK_API_KEY)
    - OpenRouter (OPENROUTER_API_KEY)
    - Google Gemini (GEMINI_API_KEY)
    - Any custom OpenAI-compatible provider (LLM_API_KEY, LLM_BASE_URL, LLM_MODEL)
    """

    def __init__(self):
        # 1. Generic / Custom OpenAI-compatible provider (Works with ANY API)
        self.llm_api_key = os.getenv("LLM_API_KEY", "").strip().strip('"').strip("'")
        self.llm_base_url = os.getenv("LLM_BASE_URL", "").strip().strip('"').strip("'")
        self.llm_model = os.getenv("LLM_MODEL", "").strip()

        # 2. OpenAI
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"').strip("'")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        # 3. Groq
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
        self.groq_model = os.getenv("GROQ_MODEL", "").strip()

        # 4. DeepSeek
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "").strip().strip('"').strip("'")
        self.deepseek_model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip()

        # 5. OpenRouter
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "").strip().strip('"').strip("'")
        self.openrouter_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free").strip()

        # 6. Gemini (OpenAI-compatible endpoint)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

        # 7. Ollama (Supports local or remote/cloud Ollama with optional API Key)
        raw_ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434").strip().rstrip("/")
        if raw_ollama_url.endswith("/api/generate"):
            self.ollama_base = raw_ollama_url[:-13]
        elif raw_ollama_url.endswith("/v1"):
            self.ollama_base = raw_ollama_url[:-3]
        else:
            self.ollama_base = raw_ollama_url

        self.ollama_api_key = os.getenv("OLLAMA_API_KEY", "").strip().strip('"').strip("'")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "phi3:mini").strip()

        # Setup client based on available environment variables
        self.client = None
        self.active_provider = None
        self.active_model = None

        self._setup_provider()

    def _setup_provider(self):
        # 1. Custom / Universal provider
        if self.llm_api_key and OpenAI is not None:
            self.active_provider = "custom"
            self.active_model = self.llm_model or "gpt-3.5-turbo"
            self.client = OpenAI(
                api_key=self.llm_api_key,
                base_url=self.llm_base_url if self.llm_base_url else None,
            )
            return

        # 2. OpenAI
        if self.openai_api_key and OpenAI is not None:
            self.active_provider = "openai"
            self.active_model = self.openai_model
            self.client = OpenAI(api_key=self.openai_api_key)
            return

        # 3. Groq
        if self.groq_api_key:
            if Groq is not None:
                self.active_provider = "groq"
                self.client = Groq(api_key=self.groq_api_key)
            elif OpenAI is not None:
                self.active_provider = "groq_openai"
                self.client = OpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=self.groq_api_key,
                )
            return

        # 4. DeepSeek
        if self.deepseek_api_key and OpenAI is not None:
            self.active_provider = "deepseek"
            self.active_model = self.deepseek_model
            self.client = OpenAI(
                base_url="https://api.deepseek.com",
                api_key=self.deepseek_api_key,
            )
            return

        # 5. OpenRouter
        if self.openrouter_api_key and OpenAI is not None:
            self.active_provider = "openrouter"
            self.active_model = self.openrouter_model
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.openrouter_api_key,
            )
            return

        # 6. Gemini
        if self.gemini_api_key and OpenAI is not None:
            self.active_provider = "gemini"
            self.active_model = self.gemini_model
            self.client = OpenAI(
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                api_key=self.gemini_api_key,
            )
            return

        # 7. Fallback to Ollama
        self.active_provider = "ollama"
        self.active_model = self.ollama_model

    def _get_groq_model(self) -> str:
        if self.groq_model:
            return self.groq_model

        candidates = [
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-20b",
            "qwen/qwen3.6-27b",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ]

        if hasattr(self.client, "models"):
            try:
                models_data = self.client.models.list().data
                avail = [m.id for m in models_data if not m.id.startswith("whisper")]
                for c in candidates:
                    if c in avail:
                        self.groq_model = c
                        return c
                if avail:
                    self.groq_model = avail[0]
                    return avail[0]
            except Exception:
                pass

        return "llama-3.3-70b-versatile"

    def generate(self, prompt: str) -> str:
        # Standard OpenAI-compatible API call
        if self.active_provider in ["custom", "openai", "deepseek", "openrouter", "gemini"]:
            res = self.client.chat.completions.create(
                model=self.active_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            return res.choices[0].message.content.strip()

        # Groq with dynamic model resolution
        if self.active_provider in ["groq", "groq_openai"]:
            model = self._get_groq_model()
            try:
                res = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
                return res.choices[0].message.content.strip()
            except Exception:
                res = self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
                return res.choices[0].message.content.strip()

        # Ollama call (supports local, remote VPS, Cloudflare tunnel, and optional OLLAMA_API_KEY)
        headers = {"Content-Type": "application/json"}
        if self.ollama_api_key:
            headers["Authorization"] = f"Bearer {self.ollama_api_key}"

        # Try native /api/generate
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
        }
        url = f"{self.ollama_base}/api/generate"

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=120)
            resp.raise_for_status()
            data = resp.json()
            if "response" in data:
                return data["response"].strip()
        except Exception:
            # Fallback to Ollama's OpenAI-compatible /v1/chat/completions
            v1_url = f"{self.ollama_base}/v1/chat/completions"
            v1_payload = {
                "model": self.ollama_model,
                "messages": [{"role": "user", "content": prompt}],
            }
            resp = requests.post(v1_url, json=v1_payload, headers=headers, timeout=120)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

        return "No response from model."
