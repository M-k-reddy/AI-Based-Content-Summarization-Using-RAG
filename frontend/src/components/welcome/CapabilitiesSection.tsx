import { motion } from "framer-motion";
import { FileText, Layers, Gauge, Cpu, Eye } from "lucide-react";

const capabilities = [
  {
    icon: FileText,
    title: "Multi-Format Upload",
    description: "Upload PDFs, DOCX, and TXT files for intelligent processing"
  },
  {
    icon: Layers,
    title: "Smart Chunking",
    description: "Automatic document segmentation with semantic understanding"
  },
  {
    icon: Gauge,
    title: "Adaptive Retrieval",
    description: "Retrieval depth adjusts based on cognitive complexity"
  },
  {
    icon: Cpu,
    title: "Local LLM Reasoning",
    description: "Powerful language model runs entirely on your hardware"
  },
  {
    icon: Eye,
    title: "Source Transparency",
    description: "Every answer includes citations to original documents"
  }
];

export function CapabilitiesSection() {
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
            System <span className="text-primary text-glow">Capabilities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete document intelligence pipeline designed for research-grade applications.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-6 text-center group"
            >
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <cap.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-sm">{cap.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
