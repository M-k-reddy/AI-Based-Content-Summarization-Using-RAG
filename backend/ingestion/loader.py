# ingestion/loader.py

import os
from config import MAX_FILE_SIZE_MB, ALLOWED_EXTENSIONS

def validate_file(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")
    
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise ValueError("File too large")

    return ext
