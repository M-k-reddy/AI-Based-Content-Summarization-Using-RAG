import { useEffect } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/main/TopBar";
import { UploadPanel } from "@/components/main/UploadPanel";
import { ChatBox } from "@/components/main/ChatBox";
import { SourcePanel } from "@/components/main/SourcePanel";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

export default function MainApp() {
  const { 
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
  } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleUpload = async (file: File) => {
    try {
      await upload(file);
      toast({
        title: "Document uploaded",
        description: `${file.name} has been indexed successfully.`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload the document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAsk = async (question: string, level?: "beginner" | "intermediate" | "advanced") => {
    try {
      await ask(question, level);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Is the backend running?",
        variant: "destructive"
      });
    }
  };

  const handleReset = async () => {
    try {
      await reset();
      toast({
        title: "Session reset",
        description: "All documents and chat history have been cleared."
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Could not reset the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-background"
    >
      <TopBar isOnline={isOnline} />
      
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        <UploadPanel 
          documents={documents}
          isUploading={isUploading}
          onUpload={handleUpload}
          onReset={handleReset}
        />
        
        <ChatBox 
          messages={messages}
          isLoading={isLoading}
          onSend={handleAsk}
        />
        
        <SourcePanel sources={currentSources} />
      </div>
    </motion.div>
  );
}
