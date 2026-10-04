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
    - Groq (GROQ_API_KEY, GROQ_KEY)
    - OpenAI (OPENAI_API_KEY, OPENAI_KEY)
    - DeepSeek (DEEPSEEK_API_KEY)
    - OpenRouter (OPENROUTER_API_KEY)
    - Google Gemini (GEMINI_API_KEY)
    - Any custom OpenAI-compatible provider (LLM_API_KEY, API_KEY)
    """

    def __init__(self):
        # 1. Generic / Custom OpenAI-compatible provider
        raw_generic = os.getenv("LLM_API_KEY") or os.getenv("API_KEY") or ""
        self.llm_api_key = raw_generic.strip().strip('"').strip("'")
        self.llm_base_url = os.getenv("LLM_BASE_URL", "").strip().strip('"').strip("'")
        self.llm_model = os.getenv("LLM_MODEL", "").strip()

        # 2. OpenAI (support OPENAI_API_KEY or OPENAI_KEY)
        raw_openai = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY") or ""
        self.openai_api_key = raw_openai.strip().strip('"').strip("'")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        # 3. Groq (support GROQ_API_KEY, GROQ_KEY, GROQ_TOKEN)
        raw_groq = os.getenv("GROQ_API_KEY") or os.getenv("GROQ_KEY") or os.getenv("GROQ_TOKEN") or ""
        self.groq_api_key = raw_groq.strip().strip('"').strip("'")
        self.groq_model = os.getenv("GROQ_MODEL", "").strip()

        # 4. DeepSeek
        raw_deepseek = os.getenv("DEEPSEEK_API_KEY") or os.getenv("DEEPSEEK_KEY") or ""
        self.deepseek_api_key = raw_deepseek.strip().strip('"').strip("'")
        self.deepseek_model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip()

        # 5. OpenRouter
        raw_openrouter = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENROUTER_KEY") or ""
        self.openrouter_api_key = raw_openrouter.strip().strip('"').strip("'")
        self.openrouter_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free").strip()

        # 6. Gemini
        raw_gemini = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_KEY") or ""
        self.gemini_api_key = raw_gemini.strip().strip('"').strip("'")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

        # 7. Ollama
        raw_ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434").strip().rstrip("/")
        if raw_ollama_url.endswith("/api/generate"):
            self.ollama_base = raw_ollama_url[:-13]
        elif raw_ollama_url.endswith("/v1"):
            self.ollama_base = raw_ollama_url[:-3]
        else:
            self.ollama_base = raw_ollama_url

        raw_ollama_key = os.getenv("OLLAMA_API_KEY") or os.getenv("OLLAMA_KEY") or ""
        self.ollama_api_key = raw_ollama_key.strip().strip('"').strip("'")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "phi3:mini").strip()

        # Smart key prefix detection:
        # If user saved a key under OLLAMA_API_KEY or LLM_API_KEY, detect what provider it actually is:
        candidate_keys = [
            self.ollama_api_key,
            self.llm_api_key,
            self.groq_api_key,
            self.openai_api_key,
            self.openrouter_api_key,
            self.deepseek_api_key,
            self.gemini_api_key,
        ]

        for k in candidate_keys:
            if not k:
                continue
            if k.startswith("gsk_") and not self.groq_api_key:
                self.groq_api_key = k
            elif k.startswith("sk-or-") and not self.openrouter_api_key:
                self.openrouter_api_key = k
            elif k.startswith("AIza") and not self.gemini_api_key:
                self.gemini_api_key = k
            elif (k.startswith("sk-proj-") or (k.startswith("sk-") and not k.startswith("sk-or-"))) and not self.openai_api_key:
                self.openai_api_key = k

        # Setup client
        self.client = None
        self.active_provider = None
        self.active_model = None

        self._setup_provider()

    def _setup_provider(self):
        # 1. Custom / Universal provider
        if self.llm_api_key and self.llm_base_url and OpenAI is not None:
            self.active_provider = "custom"
            self.active_model = self.llm_model or "gpt-3.5-turbo"
            self.client = OpenAI(
                api_key=self.llm_api_key,
                base_url=self.llm_base_url,
            )
            return

        # 2. Groq
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

        # 3. OpenAI
        if self.openai_api_key and OpenAI is not None:
            self.active_provider = "openai"
            self.active_model = self.openai_model
            self.client = OpenAI(api_key=self.openai_api_key)
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

        # If ollama_base is still localhost/127.0.0.1, check if we are in cloud
        is_local = "localhost" in self.ollama_base or "127.0.0.1" in self.ollama_base

        # Try native /api/generate
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
        }
        url = f"{self.ollama_base}/api/generate"

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            if "response" in data:
                return data["response"].strip()
        except Exception:
            # Fallback to Ollama's OpenAI-compatible /v1/chat/completions
            try:
                v1_url = f"{self.ollama_base}/v1/chat/completions"
                v1_payload = {
                    "model": self.ollama_model,
                    "messages": [{"role": "user", "content": prompt}],
                }
                resp = requests.post(v1_url, json=v1_payload, headers=headers, timeout=15)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            except Exception as e:
                if is_local:
                    raise RuntimeError(
                        "Ollama is pointing to 'localhost:11434'. Because your backend is hosted in the cloud on Render, "
                        "it cannot reach your local computer. "
                        "To fix this: If your key starts with 'gsk_', add it as GROQ_API_KEY in Render. "
                        "If you have a remote Ollama server, set OLLAMA_URL to its public address."
                    )
                raise RuntimeError(f"Could not connect to Ollama at {self.ollama_base}: {str(e)}")

        return "No response from model."
