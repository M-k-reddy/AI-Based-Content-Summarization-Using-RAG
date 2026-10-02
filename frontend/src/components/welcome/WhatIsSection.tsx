import { motion } from "framer-motion";
import { Cpu, Network, ShieldCheck, HardDrive } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Cognitive-Aware",
    description: "Dynamically adapts explanations based on your expertise level — beginner, intermediate, or advanced."
  },
  {
    icon: Network,
    title: "Document-Grounded",
    description: "All answers are grounded in your uploaded documents with transparent source citations."
  },
  {
    icon: ShieldCheck,
    title: "Fully Offline",
    description: "Runs entirely on local LLMs. Your data never leaves your machine."
  },
  {
    icon: HardDrive,
    title: "Intelligent Processing",
    description: "Smart chunking and embeddings for optimal retrieval and context understanding."
  }
];

export function WhatIsSection() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What is <span className="text-primary text-glow">RAG Summarization</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This is an offline, document-grounded AI system that dynamically adapts 
            its explanations based on the user's cognitive level — making complex 
            information accessible to everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card p-6 group cursor-default"
            >
              <div className="mb-4 relative">
                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <feature.icon className="relative w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
