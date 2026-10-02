const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";


export interface UploadResponse {
  success: boolean;
  filename: string;
  message: string;
  chunks_created?: number;
}

export interface Source {
  chunk_id: string;
  document: string;
  content: string;
  relevance_score?: number;
}

export interface AskResponse {
  answer: string;
  detected_level: "beginner" | "intermediate" | "advanced";
  sources: Source[];
  confidence?: number;
}

export interface ResetResponse {
  success: boolean;
  message: string;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  return res.json();
}

export async function askQuestion(
  question: string,
  preferredLevel?: "beginner" | "intermediate" | "advanced"
): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      question,
      preferred_level: preferredLevel 
    }),
  });

  if (!res.ok) {
    throw new Error(`Question failed: ${res.statusText}`);
  }

  return res.json();
}

export async function resetSession(): Promise<ResetResponse> {
  const res = await fetch(`${API_BASE}/reset`, { 
    method: "POST" 
  });

  if (!res.ok) {
    throw new Error(`Reset failed: ${res.statusText}`);
  }

  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
    });
    return res.ok;
  } catch {
    return false;
  }
}
