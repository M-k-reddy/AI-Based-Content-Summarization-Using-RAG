import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onEnter: () => void;
}

export function HeroSection({ onEnter }: HeroSectionProps) {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Floating Brain Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse-glow" />
          <Brain className="relative w-20 h-20 text-primary animate-float" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
      >
        <span className="text-foreground text-3xl md:text-5xl font-bold block mb-4">AI based Content Summarization</span>
        <span className="block text-2xl md:text-3xl mt-4 font-light text-primary text-glow">
          Using Retrieval-Augmented Generation (RAG)
        </span>
      </motion.h1>

      {/* Subtitle with typewriter effect */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
      >
        An AI system that doesn't just retrieve answers —{" "}
        <span className="text-primary font-medium">it adapts how it explains</span>.
        Powered by local LLMs with complete transparency and cognitive awareness.
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnter}
        className="group relative px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg transition-all duration-300 neural-glow hover:shadow-2xl"
      >
        <span className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Enter the Cognitive Interface
          <Sparkles className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
        </span>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 group-hover:border-primary transition-colors" />
      </motion.button>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse-soft" />
        </motion.div>
      </motion.div>
    </section>
  );
}
