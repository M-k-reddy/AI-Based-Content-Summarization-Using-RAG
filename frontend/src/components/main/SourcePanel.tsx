import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, ChevronDown, ChevronUp, FileText, Hash } from "lucide-react";
import { useState } from "react";
import type { Source } from "@/lib/api";

interface SourcePanelProps {
  sources: Source[];
}

export function SourcePanel({ sources }: SourcePanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="border-l border-border bg-card/50 p-4 flex flex-col h-full"
    >
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <FileSearch className="w-4 h-4 text-primary" />
        Sources
      </h2>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
        {sources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No sources yet</p>
            <p className="text-xs mt-1">Ask a question to see retrieved chunks</p>
          </div>
        ) : (
          <AnimatePresence>
            {sources.map((source, index) => (
              <SourceCard key={`${source.document}-${source.chunk_id}-${index}`} source={source} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.aside>
  );
}

interface SourceCardProps {
  source: Source;
  index: number;
}

function SourceCard({ source, index }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-start gap-3 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{source.document}</p>
          <div className="flex items-center gap-2 mt-1">
            <Hash className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {source.chunk_id}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
                {source.content}
              </p>
              {source.relevance_score !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${source.relevance_score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(source.relevance_score * 100)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
