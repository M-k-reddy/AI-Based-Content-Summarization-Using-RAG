import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Trash2, RotateCcw, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Document } from "@/hooks/useApi";

interface UploadPanelProps {
  documents: Document[];
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onReset: () => Promise<void>;
}

export function UploadPanel({ documents, isUploading, onUpload, onReset }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await onUpload(file);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await onUpload(file);
    }
    e.target.value = "";
  }, [onUpload]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="border-r border-border bg-card/50 p-4 flex flex-col h-full"
    >
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Documents
      </h2>

      {/* Upload Zone */}
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center p-6 mb-4
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-primary/5"
          }
        `}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        ) : (
          <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        )}
        
        <span className="text-sm text-center text-muted-foreground">
          {isDragging ? "Drop files here" : "Drag & drop or click"}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          PDF, DOCX, TXT
        </span>

        {isDragging && (
          <div className="absolute inset-0 rounded-xl border-glow pointer-events-none" />
        )}
      </label>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-3 flex items-center gap-3"
            >
              <div className="flex-shrink-0">
                {doc.status === "uploading" && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {doc.status === "indexed" && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
                {doc.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.status === "uploading" && "Processing..."}
                  {doc.status === "indexed" && `${doc.chunksCreated || 0} chunks`}
                  {doc.status === "error" && "Upload failed"}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {documents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No documents uploaded yet
          </div>
        )}
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        disabled={isResetting || documents.length === 0}
        className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {isResetting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        Reset Session
      </motion.button>
    </motion.aside>
  );
}
