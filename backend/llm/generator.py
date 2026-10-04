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
    Universal LLM Generator supporting:
    - Ollama Cloud (OLLAMA_API_KEY -> https://ollama.com)
    - Ollama Local (OLLAMA_URL=http://localhost:11434)
    - Groq (GROQ_API_KEY)
    - OpenAI (OPENAI_API_KEY)
    - DeepSeek (DEEPSEEK_API_KEY)
    - OpenRouter (OPENROUTER_API_KEY)
    - Google Gemini (GEMINI_API_KEY)
    - Any custom OpenAI-compatible provider (LLM_API_KEY, LLM_BASE_URL)
    """

    def __init__(self):
        # 1. Generic / Custom OpenAI-compatible provider
        raw_generic = os.getenv("LLM_API_KEY") or os.getenv("API_KEY") or ""
        self.llm_api_key = raw_generic.strip().strip('"').strip("'")
        self.llm_base_url = os.getenv("LLM_BASE_URL", "").strip().strip('"').strip("'")
        self.llm_model = os.getenv("LLM_MODEL", "").strip()

        # 2. OpenAI
        raw_openai = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY") or ""
        self.openai_api_key = raw_openai.strip().strip('"').strip("'")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        # 3. Groq
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

        # 7. Ollama (Cloud or Local)
        raw_ollama_key = os.getenv("OLLAMA_API_KEY") or os.getenv("OLLAMA_KEY") or ""
        self.ollama_api_key = raw_ollama_key.strip().strip('"').strip("'")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "").strip()

        # If OLLAMA_API_KEY is provided and no OLLAMA_URL is set, use official Ollama Cloud (https://ollama.com)
        default_ollama_url = "https://ollama.com" if self.ollama_api_key else "http://localhost:11434"
        raw_ollama_url = os.getenv("OLLAMA_URL", default_ollama_url).strip().rstrip("/")
        
        if raw_ollama_url.endswith("/api/generate"):
            self.ollama_base = raw_ollama_url[:-13]
        elif raw_ollama_url.endswith("/api/chat"):
            self.ollama_base = raw_ollama_url[:-9]
        elif raw_ollama_url.endswith("/api"):
            self.ollama_base = raw_ollama_url[:-4]
        elif raw_ollama_url.endswith("/v1"):
            self.ollama_base = raw_ollama_url[:-3]
        else:
            self.ollama_base = raw_ollama_url

        # Check if any key has a known cloud provider prefix
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

        # 2. Ollama Cloud (when OLLAMA_API_KEY is present and not an auto-detected third-party key)
        if self.ollama_api_key and not self.ollama_api_key.startswith("gsk_") and not self.ollama_api_key.startswith("sk-"):
            self.active_provider = "ollama"
            self.active_model = self.ollama_model
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

        # 4. OpenAI
        if self.openai_api_key and OpenAI is not None:
            self.active_provider = "openai"
            self.active_model = self.openai_model
            self.client = OpenAI(api_key=self.openai_api_key)
            return

        # 5. DeepSeek
        if self.deepseek_api_key and OpenAI is not None:
            self.active_provider = "deepseek"
            self.active_model = self.deepseek_model
            self.client = OpenAI(
                base_url="https://api.deepseek.com",
                api_key=self.deepseek_api_key,
            )
            return

        # 6. OpenRouter
        if self.openrouter_api_key and OpenAI is not None:
            self.active_provider = "openrouter"
            self.active_model = self.openrouter_model
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.openrouter_api_key,
            )
            return

        # 7. Gemini
        if self.gemini_api_key and OpenAI is not None:
            self.active_provider = "gemini"
            self.active_model = self.gemini_model
            self.client = OpenAI(
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                api_key=self.gemini_api_key,
            )
            return

        # 8. Fallback to Ollama (Local)
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

    def _get_ollama_model(self) -> str:
        if self.ollama_model:
            return self.ollama_model

        # Auto-detect available models on Ollama Cloud (https://ollama.com)
        if "ollama.com" in self.ollama_base:
            try:
                headers = {}
                if self.ollama_api_key:
                    headers["Authorization"] = f"Bearer {self.ollama_api_key}"
                resp = requests.get(f"{self.ollama_base}/v1/models", headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    available_ids = [m["id"] for m in data]
                    preference = [
                        "gpt-oss:20b",
                        "deepseek-v4.1-flash",
                        "glm-5.3-flash",
                        "nemotron-3-nano:30b",
                        "gemma4:31b",
                        "kimi-k2.6"
                    ]
                    for p in preference:
                        if p in available_ids:
                            self.ollama_model = p
                            return p
                    if available_ids:
                        self.ollama_model = available_ids[0]
                        return available_ids[0]
            except Exception:
                pass
            return "gpt-oss:20b"

        # Local Ollama default
        return "phi3:mini"

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

        # Ollama call (supports Ollama Cloud with API Key, or Local Ollama)
        headers = {"Content-Type": "application/json"}
        if self.ollama_api_key:
            headers["Authorization"] = f"Bearer {self.ollama_api_key}"

        model = self._get_ollama_model()
        last_err = None

        # 1. Try /api/chat
        try:
            chat_url = f"{self.ollama_base}/api/chat"
            chat_payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            }
            resp = requests.post(chat_url, json=chat_payload, headers=headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                if "message" in data and "content" in data["message"]:
                    return data["message"]["content"].strip()
            last_err = f"Status {resp.status_code}: {resp.text}"
        except Exception as e:
            last_err = str(e)

        # 2. Try /v1/chat/completions (OpenAI-compatible)
        try:
            v1_url = f"{self.ollama_base}/v1/chat/completions"
            v1_payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            }
            resp = requests.post(v1_url, json=v1_payload, headers=headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            last_err = f"Status {resp.status_code}: {resp.text}"
        except Exception as e:
            last_err = str(e)

        # 3. Try /api/generate
        try:
            gen_url = f"{self.ollama_base}/api/generate"
            gen_payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
            }
            resp = requests.post(gen_url, json=gen_payload, headers=headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                if "response" in data:
                    return data["response"].strip()
            last_err = f"Status {resp.status_code}: {resp.text}"
        except Exception as e:
            last_err = str(e)

        if "localhost" in self.ollama_base or "127.0.0.1" in self.ollama_base:
            raise RuntimeError(
                f"Ollama is pointing to {self.ollama_base}. In the cloud, it cannot reach your local PC. "
                f"If using Ollama Cloud, set OLLAMA_URL=https://ollama.com. Error: {last_err}"
            )

        raise RuntimeError(f"Ollama request to {self.ollama_base} (model: {model}) failed: {last_err}")
