import { Brain, Wifi, WifiOff } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { motion } from "framer-motion";

interface TopBarProps {
  isOnline: boolean | null;
}

export function TopBar({ isOnline }: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border glass flex items-center justify-between px-6"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
          <Brain className="relative w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">RAG Summarizer</h1>
          <p className="text-xs text-muted-foreground">AI Content Summarization</p>
        </div>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-4">
        {/* LLM Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
          {isOnline === null ? (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
              <span className="text-xs text-muted-foreground">Checking...</span>
            </>
          ) : isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Local LLM: Online</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">LLM: Offline</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
