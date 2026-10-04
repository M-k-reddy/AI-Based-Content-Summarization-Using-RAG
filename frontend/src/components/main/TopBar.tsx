import { Brain, Wifi, WifiOff, FileText, FileSearch } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { motion } from "framer-motion";

interface TopBarProps {
  isOnline: boolean | null;
  showDocs?: boolean;
  onToggleDocs?: () => void;
  showSources?: boolean;
  onToggleSources?: () => void;
  documentsCount?: number;
  sourcesCount?: number;
}

export function TopBar({ 
  isOnline,
  showDocs = true,
  onToggleDocs,
  showSources = true,
  onToggleSources,
  documentsCount = 0,
  sourcesCount = 0
}: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border glass flex items-center justify-between px-4 md:px-6"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
          <Brain className="relative w-7 h-7 md:w-8 md:h-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-bold text-base md:text-lg tracking-tight">RAG Summarizer</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">AI Content Summarization</p>
        </div>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Panel Toggles */}
        {onToggleDocs && (
          <button
            onClick={onToggleDocs}
            title={showDocs ? "Hide Documents panel" : "Show Documents panel"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showDocs 
                ? "bg-primary/15 border-primary/40 text-primary" 
                : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Docs</span>
            {documentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-[10px] text-primary font-bold">
                {documentsCount}
              </span>
            )}
          </button>
        )}

        {onToggleSources && (
          <button
            onClick={onToggleSources}
            title={showSources ? "Hide Sources panel" : "Show Sources panel"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSources 
                ? "bg-primary/15 border-primary/40 text-primary" 
                : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sources</span>
            {sourcesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-[10px] text-primary font-bold">
                {sourcesCount}
              </span>
            )}
          </button>
        )}

        {/* LLM Status */}
        <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 rounded-lg glass text-xs">
          {isOnline === null ? (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
              <span className="text-[11px] text-muted-foreground hidden sm:inline">Checking...</span>
            </>
          ) : isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-primary">Online</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[11px] text-destructive">Offline</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
