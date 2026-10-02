import { motion } from "framer-motion";

interface CognitiveBadgeProps {
  level: "beginner" | "intermediate" | "advanced";
  size?: "sm" | "md";
}

const levelConfig = {
  beginner: {
    label: "Beginner",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Simplified explanations"
  },
  intermediate: {
    label: "Intermediate",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Balanced depth"
  },
  advanced: {
    label: "Advanced",
    color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    description: "Technical details"
  }
};

export function CognitiveBadge({ level, size = "md" }: CognitiveBadgeProps) {
  const config = levelConfig[level];
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        ${config.color}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </motion.span>
  );
}

interface CognitiveLevelSelectorProps {
  value: "beginner" | "intermediate" | "advanced" | "auto";
  onChange: (value: "beginner" | "intermediate" | "advanced" | "auto") => void;
}

export function CognitiveLevelSelector({ value, onChange }: CognitiveLevelSelectorProps) {
  const options = [
    { value: "auto" as const, label: "Auto-Detect" },
    { value: "beginner" as const, label: "Beginner" },
    { value: "intermediate" as const, label: "Intermediate" },
    { value: "advanced" as const, label: "Advanced" }
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${value === option.value 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
