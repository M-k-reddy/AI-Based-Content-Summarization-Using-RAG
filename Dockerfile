# ==========================================
# Stage 1: Build the React/Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ENV VITE_API_BASE=""
RUN npm run build

# ==========================================
# Stage 2: Python Backend Runtime (All-in-One)
# ==========================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU first (saves disk space and keeps memory light)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download SentenceTransformer model during Docker BUILD
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy backend code
COPY backend/ .

# Copy built frontend assets into the static directory served by FastAPI
COPY --from=frontend-builder /app/frontend/dist ./static

# Cloud Run automatically sets PORT (defaults to 8080)
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}"]
