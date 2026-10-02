from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import tempfile
import os
import uuid

from ingestion.loader import validate_file
from ingestion.extractor import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt
)
from ingestion.chunker import chunk_text
from embeddings.embedder import TextEmbedder
from vectorstore.faiss_index import FaissVectorStore
from cognition.estimator import CognitiveStateEstimator
from retrieval.adaptive_retriever import AdaptiveRetriever
from prompting.prompt_builder import build_prompt
from llm.generator import LLMGenerator

router = APIRouter()

# ---------- GLOBAL STATE (Simple Session-Based) ----------
embedder = TextEmbedder()
vector_store: FaissVectorStore | None = None
cognitive_estimator = CognitiveStateEstimator()
llm = LLMGenerator()
previous_questions: List[str] = []


# ---------- UPLOAD DOCUMENT ----------
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    global vector_store

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    document_id = str(uuid.uuid4())
    suffix = os.path.splitext(file.filename)[1]

    # Create OS-safe temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    try:
        # Validate file
        ext = validate_file(temp_path)

        # Extract text
        if ext == ".pdf":
            text = extract_text_from_pdf(temp_path)
        elif ext == ".docx":
            text = extract_text_from_docx(temp_path)
        else:
            text = extract_text_from_txt(temp_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Uploaded document contains no readable text"
            )

        # Chunk document
        chunks = chunk_text(text, document_id, file.filename)

        texts = [chunk.text for chunk in chunks]
        embeddings = embedder.embed_texts(texts)

        # Initialize vector store if needed
        if vector_store is None:
            vector_store = FaissVectorStore(embeddings.shape[1])

        vector_store.add_embeddings(embeddings, chunks)

        return {
            "success": True,
            "filename": file.filename,
            "message": "Document indexed successfully",
            "chunks_created": len(chunks)
        }

    finally:
        # Always remove temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ---------- ASK QUESTION ----------
@router.post("/ask")
async def ask_question(payload: dict):
    global previous_questions

    if vector_store is None:
        raise HTTPException(
            status_code=400,
            detail="No documents uploaded yet"
        )

    question = payload.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    retriever = AdaptiveRetriever(
        vector_store=vector_store,
        embedder=embedder,
        cognitive_estimator=cognitive_estimator
    )

    retrieved_chunks, cognitive_state = retriever.retrieve(
        question, previous_questions
    )

    prompt = build_prompt(
        question=question,
        retrieved_chunks=retrieved_chunks,
        cognitive_state=cognitive_state
    )

    try:
        answer = llm.generate(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"LLM service unavailable. Make sure Ollama is running on localhost:11434. Error: {str(e)}"
        )

    previous_questions.append(question)

    sources = [
        {
            "chunk_id": chunk.chunk_id,
            "document": chunk.document_name,
            "content": chunk.text,
            "relevance_score": getattr(chunk, 'relevance_score', None)
        }
        for chunk in retrieved_chunks
    ]

    return {
        "answer": answer,
        "detected_level": cognitive_state.lower(),
        "sources": sources
    }


# ---------- RESET SESSION ----------
@router.post("/reset")
async def reset_session():
    global vector_store, previous_questions

    vector_store = None
    previous_questions = []

    return {
        "success": True,
        "message": "Session reset successfully"
    }
