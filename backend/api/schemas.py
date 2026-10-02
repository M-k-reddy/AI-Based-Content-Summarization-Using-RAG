from pydantic import BaseModel
from typing import List, Optional

class AskRequest(BaseModel):
    question: str
    previous_questions: Optional[List[str]] = []

class AskResponse(BaseModel):
    answer: str
    cognitive_state: str
    sources: List[str]

class UploadResponse(BaseModel):
    message: str
    num_chunks: int
