# prompting/prompt_builder.py

from typing import List
from models.chunk import DocumentChunk

BASE_INSTRUCTIONS = """
You are an AI assistant that answers questions strictly using the provided context.

Formatting & Structure Rules:
1. Grounding: Answer strictly and faithfully using the provided context. If the context is insufficient, state clearly: "The provided documents do not contain enough information to answer this question."
2. Structure: Present your answer in clear, well-organized sections using clean markdown headings (###).
3. Readability: Use clear bullet points (-) and concise explanations. Avoid giant walls of unformatted text.
4. Clean Typography:
   - Use standard plain characters only. Avoid special unicode symbols, non-breaking hyphens, or broken glyphs.
   - Do NOT use LaTeX math wrappers like \( ... \) or \[ ... \]. Write expressions plainly as O(n) or O(1).
   - Format any code cleanly inside standard markdown code blocks with the language tag (e.g., ```java).
5. Tone: Be direct, structured, and easy to read.
"""

COGNITIVE_STYLES = {
    "BEGINNER": """
Target Audience: Beginner / Fresher Level
- Explain in simple, friendly, and easy-to-understand terms.
- Avoid unnecessary jargon and explain technical words simply.
- Use step-by-step bullet points with clear takeaways.
""",
    "INTERMEDIATE": """
Target Audience: Intermediate Level
- Provide a balanced explanation with clear technical definitions.
- Structure logically with headings, code snippets (if applicable), and step-by-step logic.
""",
    "ADVANCED": """
Target Audience: Advanced Level
- Provide an in-depth, precise technical explanation.
- Focus on algorithms, complexity, edge cases, and implementation details.
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
