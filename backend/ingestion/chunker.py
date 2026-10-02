# ingestion/chunker.py

from typing import List
from models.chunk import DocumentChunk
from config import CHUNK_SIZE, CHUNK_OVERLAP

def chunk_text(
    text: str,
    document_id: str,
    document_name: str
) -> List[DocumentChunk]:

    words = text.split()
    chunks = []

    start = 0
    chunk_id = 0

    while start < len(words):
        end = start + CHUNK_SIZE
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

        chunks.append(
            DocumentChunk(
                text=chunk_text,
                document_id=document_id,
                document_name=document_name,
                chunk_id=chunk_id
            )
        )

        chunk_id += 1
        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks
