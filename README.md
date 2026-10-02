# AI based Content Summarization Using RAG

An offline, document-grounded Retrieval-Augmented Generation (RAG) system that adapts its explanations and summaries to the user's cognitive level.

## 🚀 Features

- **Cognitive-Aware Adaptability**: Dynamically adjusts answer depth and complexity (Beginner, Intermediate, Advanced) based on user preference or automatic detection.
- **Offline & Private**: Built entirely on local LLMs (Ollama) and local embeddings, ensuring your uploaded documents never leave your machine.
- **Document Grounding**: Ingests files (`.pdf`, `.docx`, `.txt`) into a local FAISS vector store for semantic search and retrieval with source citations.
- **Modern User Interface**: A futuristic, dark-themed responsive dashboard for easy document management and chat interactions.

---

## 🛠️ Prerequisites

Before running the project, ensure you have the following installed:
1. **Python** (version 3.10 or higher)
2. **Node.js** (version 18 or higher) & **npm**
3. **Ollama** (for local LLM inference)

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
