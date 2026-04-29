"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

export function GlossaryTooltip({ word, definition, example, children }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 200); };

  return (
    <span className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <span className="cursor-help underline decoration-primary/50 decoration-wavy text-primary font-medium">{children}</span>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 glass rounded-xl border pointer-events-none">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b"><BookOpen className="w-4 h-4 text-primary" /><strong className="text-sm">{word}</strong></div>
            <p className="text-sm text-muted-foreground">{definition}</p>
            {example && <div className="mt-3 p-2 bg-muted/30 rounded-lg"><span className="text-xs text-primary font-bold">예시</span><p className="text-xs text-muted-foreground">{example}</p></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
