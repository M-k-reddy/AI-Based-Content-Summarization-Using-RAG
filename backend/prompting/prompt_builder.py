# prompting/prompt_builder.py

from typing import List
from models.chunk import DocumentChunk

BASE_INSTRUCTIONS = """
You are an AI assistant that answers questions strictly using the provided context.

Rules:
- Use ONLY the information in the context.
- Do NOT use external knowledge.
- If the context is insufficient, say "The provided documents do not contain enough information."
- Be faithful to the source text.
"""

COGNITIVE_STYLES = {
    "BEGINNER": """
Explain the answer in very simple terms.
Avoid jargon.
Use short sentences and intuitive explanations.
Assume the user is new to the topic.
""",
    "INTERMEDIATE": """
Explain the answer clearly with moderate technical depth.
Use correct terminology and brief definitions.
Structure the explanation logically.
""",
    "ADVANCED": """
Provide a detailed and technical explanation.
Assume the user has prior knowledge.
Be precise and concise.
Avoid oversimplification.
"""
}

def build_prompt(
    question: str,
    retrieved_chunks: List[DocumentChunk],
    cognitive_state: str
) -> str:

    context = "\n\n".join(
        f"[Source: {chunk.document_name} | Chunk {chunk.chunk_id}]\n{chunk.text}"
        for chunk in retrieved_chunks
    )

    prompt = f"""
{BASE_INSTRUCTIONS}

{COGNITIVE_STYLES.get(cognitive_state, COGNITIVE_STYLES['INTERMEDIATE'])}

Context:
{context}

Question:
{question}

Answer:
"""

    return prompt.strip()
