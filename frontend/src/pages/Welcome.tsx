import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/welcome/NeuralBackground";
import { HeroSection } from "@/components/welcome/HeroSection";
import { WhatIsSection } from "@/components/welcome/WhatIsSection";
import { ComparisonSection } from "@/components/welcome/ComparisonSection";
import { CapabilitiesSection } from "@/components/welcome/CapabilitiesSection";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface WelcomeProps {
  onEnter: () => void;
}

export default function Welcome({ onEnter }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Neural Network Background */}
      <NeuralBackground particleCount={100} connectionDistance={180} />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Theme Toggle - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 right-6 z-50"
      >
        <ThemeToggle />
      </motion.div>

      {/* Content Sections */}
      <HeroSection onEnter={onEnter} />
      <WhatIsSection />
      <ComparisonSection />
      <CapabilitiesSection />

      {/* Footer CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-muted-foreground mb-8">
            Ready to experience cognitive-aware document intelligence?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold transition-all neural-glow-sm hover:shadow-xl"
          >
            Launch RAG Summarizer Interface
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
