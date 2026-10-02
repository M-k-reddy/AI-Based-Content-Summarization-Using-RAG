from ingestion.loader import validate_file
from ingestion.extractor import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt
)
from ingestion.chunker import chunk_text

file_path = "example.pdf"
document_id = "doc_001"
document_name = "Research Paper"

ext = validate_file(file_path)

if ext == ".pdf":
    text = extract_text_from_pdf(file_path)
elif ext == ".docx":
    text = extract_text_from_docx(file_path)
else:
    text = extract_text_from_txt(file_path)

chunks = chunk_text(text, document_id, document_name)

print(f"Created {len(chunks)} chunks")
