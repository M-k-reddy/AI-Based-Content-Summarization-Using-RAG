# ingestion/extractor.py

import pdfplumber
from docx import Document

def extract_text_from_pdf(file_path: str) -> str:
    text = []

    # 1. Try pypdf first (high performance, low memory footprint)
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text.append(page_text.strip())
        if text:
            return "\n\n".join(text)
    except Exception:
        pass

    # 2. Fallback to pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text(layout=False)
                if page_text and page_text.strip():
                    text.append(page_text.strip())
    except Exception as e:
        if not text:
            raise ValueError(f"Could not parse PDF: {str(e)}")

    return "\n\n".join(text)

def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()
