import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { CognitiveLevelSelector } from "./CognitiveBadge";
import type { Message } from "@/hooks/useApi";

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string, level?: "beginner" | "intermediate" | "advanced") => Promise<void>;
}

export function ChatBox({ messages, isLoading, onSend }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [cognitiveLevel, setCognitiveLevel] = useState<"beginner" | "intermediate" | "advanced" | "auto">("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    
    const level = cognitiveLevel === "auto" ? undefined : cognitiveLevel;
    await onSend(message, level);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col h-full w-full bg-background/50 overflow-hidden"
    >
      {/* Cognitive Level Selector */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Cognitive Level:</span>
        <CognitiveLevelSelector value={cognitiveLevel} onChange={setCognitiveLevel} />
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" />
              <Sparkles className="relative w-16 h-16 text-primary animate-pulse-soft" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to RAG Content Summarizer</h3>
            <p className="text-muted-foreground max-w-md">
              Upload documents on the left panel, then ask questions. 
              I'll adapt my explanations to your cognitive level.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 h-2 rounded-full bg-primary/60"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="relative group">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the uploaded documents..."
            rows={1}
            className="w-full px-4 py-3 pr-14 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all placeholder:text-muted-foreground"
          />
          
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none transition-all neural-glow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </motion.main>
  );
}
