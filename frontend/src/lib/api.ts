const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:8000" : "");


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

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let msg = `Upload failed (${res.status} ${res.statusText})`;
      try {
        const data = await res.json();
        if (data && data.detail) msg = data.detail;
      } catch (_) {}
      throw new Error(msg);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    throw new Error("Backend server is waking up or deploying. Please wait 10 seconds and try again.");
  }
}

export async function askQuestion(
  question: string,
  preferredLevel?: "beginner" | "intermediate" | "advanced"
): Promise<AskResponse> {
  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        question,
        preferred_level: preferredLevel 
      }),
    });

    if (!res.ok) {
      let msg = `Question failed (${res.status} ${res.statusText})`;
      try {
        const data = await res.json();
        if (data && data.detail) msg = data.detail;
      } catch (_) {}
      throw new Error(msg);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    throw new Error("Backend server is waking up or deploying. Please wait 10 seconds and try again.");
  }
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
