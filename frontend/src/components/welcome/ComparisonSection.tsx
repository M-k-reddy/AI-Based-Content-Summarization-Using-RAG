import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";

const comparisons = [
  {
    traditional: "Static answers for everyone",
    carag: "Adaptive explanations per user"
  },
  {
    traditional: "Same depth regardless of expertise",
    carag: "Cognitive-aware depth adjustment"
  },
  {
    traditional: "Black-box retrieval process",
    carag: "Transparent source citations"
  },
  {
    traditional: "Cloud-dependent processing",
    carag: "Fully local LLM inference"
  }
];

export function ComparisonSection() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How this RAG system is <span className="text-primary text-glow">Different</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Traditional RAG systems provide one-size-fits-all answers. 
            It understands how you think.
          </p>
        </motion.div>

        <div className="space-y-4">
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                {/* Traditional RAG */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-muted-foreground">{item.traditional}</span>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-6 h-6 text-primary flex-shrink-0 rotate-90 md:rotate-0" />

                {/* CA-RAG */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item.carag}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
