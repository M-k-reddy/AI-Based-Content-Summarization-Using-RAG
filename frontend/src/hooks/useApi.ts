import { useState, useCallback } from "react";
import { 
  uploadDocument, 
  askQuestion, 
  resetSession, 
  checkHealth,
  type UploadResponse,
  type AskResponse,
  type Source
} from "@/lib/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  detectedLevel?: "beginner" | "intermediate" | "advanced";
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  status: "uploading" | "indexed" | "error";
  chunksCreated?: number;
}

export function useApi() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [currentSources, setCurrentSources] = useState<Source[]>([]);

  const checkStatus = useCallback(async () => {
    const online = await checkHealth();
    setIsOnline(online);
    return online;
  }, []);

  const upload = useCallback(async (file: File) => {
    const docId = crypto.randomUUID();
    
    setDocuments(prev => [...prev, {
      id: docId,
      name: file.name,
      status: "uploading"
    }]);
    
    setIsUploading(true);
    
    try {
      const response: UploadResponse = await uploadDocument(file);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, status: "indexed" as const, chunksCreated: response.chunks_created }
          : doc
      ));
      
      return response;
    } catch (error) {
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, status: "error" as const }
          : doc
      ));
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const ask = useCallback(async (
    question: string, 
    preferredLevel?: "beginner" | "intermediate" | "advanced"
  ) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response: AskResponse = await askQuestion(question, preferredLevel);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        detectedLevel: response.detected_level,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSources(response.sources);
      
      return response;
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your question. Please ensure the backend is running and try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await resetSession();
      setMessages([]);
      setDocuments([]);
      setCurrentSources([]);
    } catch (error) {
      console.error("Failed to reset session:", error);
      throw error;
    }
  }, []);

  return {
    messages,
    documents,
    currentSources,
    isLoading,
    isUploading,
    isOnline,
    upload,
    ask,
    reset,
    checkStatus
  };
}
