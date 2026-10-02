# models/chunk.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class DocumentChunk:
    text: str
    document_id: str
    document_name: str
    chunk_id: int
    page_number: Optional[int] = None
