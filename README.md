# AI based Content Summarization Using RAG

A document-grounded Retrieval-Augmented Generation (RAG) system that adapts its explanations and summaries to the user's cognitive level (Beginner, Intermediate, Advanced).

## 🚀 Features

- **Cognitive-Aware Adaptability**: Dynamically adjusts explanation depth and technical complexity based on user preference or automatic cognitive detection.
- **Hybrid LLM Architecture**: 
  - **Local Development**: Runs 100% offline and private using local LLMs (Ollama with `phi3:mini`) and local SentenceTransformer embeddings, ensuring uploaded documents never leave your machine.
  - **Cloud Deployment**: Seamlessly switches to hosted LLM APIs (Ollama Cloud, Groq, OpenAI, or Google Gemini) for scalable serverless cloud execution (Google Cloud Run / Render).
- **Document Grounding**: Ingests files (`.pdf`, `.docx`, `.txt`, `.md` up to 30MB) into a FAISS vector store for semantic search and retrieval with transparent source citations.
- **Modern Responsive Interface**: A futuristic, dark-themed dashboard with collapsible sidebars and fluid chat interaction.

---

## 🛠️ Prerequisites

Before running the project locally, ensure you have the following installed:
1. **Python** (version 3.10 or higher)
2. **Node.js** (version 18 or higher) & **npm**
3. **Ollama** (for local offline LLM inference) *or* a Cloud LLM API key (Ollama Cloud, Groq, OpenAI, Gemini)

---

## 💻 Getting Started

### 1. Setup Ollama
Make sure Ollama is installed and running, then pull the required **Phi-3 Mini** model:
```bash
ollama run phi3:mini
```

### 2. Setup & Run the Backend
The backend is powered by FastAPI and Uvicorn.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. Install dependencies (if not already done):
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```

The backend API will be available at `http://localhost:8000`.

### 3. Setup & Run the Frontend
The frontend is built using React, Vite, Tailwind CSS, and shadcn/ui.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application UI will open at `http://localhost:5173`.

---

## 📂 Project Structure

```text
├── backend/            # FastAPI Backend
│   ├── api/            # API Router and schemas
│   ├── ingestion/      # Document text extraction and chunking
│   ├── vectorstore/    # FAISS index handling
│   ├── embeddings/     # SentenceTransformer embeddings generator
│   └── llm/            # Ollama API interaction logic
├── frontend/           # Vite + React Frontend
│   ├── src/
│   │   ├── components/ # Chat UI, Welcome panels, layout elements
│   │   ├── pages/      # Application views
│   │   └── lib/        # API connection helper
└── README.md           # Project documentation
```
