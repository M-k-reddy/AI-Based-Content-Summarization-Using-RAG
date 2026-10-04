import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Responsive sidebar toggles
  const [showDocs, setShowDocs] = useState(true);
  const [showSources, setShowSources] = useState(false);

  // Auto-collapse sources on smaller screens initially
  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setShowSources(true);
    }
  }, []);

  // When sources are fetched after a question, open sources panel
  useEffect(() => {
    if (currentSources && currentSources.length > 0) {
      setShowSources(true);
    }
  }, [currentSources]);

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
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Could not upload the document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAsk = async (question: string, level?: "beginner" | "intermediate" | "advanced") => {
    try {
      await ask(question, level);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to get a response. Is the backend running?",
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
      className="h-screen flex flex-col bg-background overflow-hidden"
    >
      <TopBar 
        isOnline={isOnline} 
        showDocs={showDocs}
        onToggleDocs={() => setShowDocs(!showDocs)}
        showSources={showSources}
        onToggleSources={() => setShowSources(!showSources)}
        documentsCount={documents.length}
        sourcesCount={currentSources.length}
      />
      
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Documents Left Sidebar */}
        <AnimatePresence initial={false}>
          {showDocs && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[260px] md:w-[280px] shrink-0 h-full border-r border-border overflow-hidden"
            >
              <UploadPanel 
                documents={documents}
                isUploading={isUploading}
                onUpload={handleUpload}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Flexible Chat Area */}
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
          <ChatBox 
            messages={messages}
            isLoading={isLoading}
            onSend={handleAsk}
          />
        </div>
        
        {/* Sources Right Sidebar */}
        <AnimatePresence initial={false}>
          {showSources && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[280px] md:w-[320px] shrink-0 h-full border-l border-border overflow-hidden"
            >
              <SourcePanel sources={currentSources} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
