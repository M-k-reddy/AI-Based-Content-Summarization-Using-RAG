import { motion } from "framer-motion";
import { User, Bot, FileText } from "lucide-react";
import { CognitiveBadge } from "./CognitiveBadge";
import type { Message } from "@/hooks/useApi";

interface MessageBubbleProps {
  message: Message;
  onSourceClick?: (chunkId: string) => void;
}

export function MessageBubble({ message, onSourceClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
        ${isUser ? "bg-primary/20" : "bg-accent/20"}
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className={`
          inline-block p-4 rounded-2xl
          ${isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "glass-card rounded-tl-sm"
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Cognitive Level Badge & Sources (for AI messages) */}
        {!isUser && (message.detectedLevel || message.sources?.length) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {message.detectedLevel && (
              <CognitiveBadge level={message.detectedLevel} size="sm" />
            )}
            
            {message.sources && message.sources.length > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}
