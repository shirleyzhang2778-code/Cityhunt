"use client";

import { motion } from "framer-motion";

type Props = {
  progress: number;
  className?: string;
};

export function AppleProgressBar({ progress, className = "" }: Props) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-full overflow-hidden rounded-full bg-muted/30 ${className}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#34D399] to-[#60A5FA]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted tabular-nums">{Math.round(pct)}%</span>
    </div>
  );
}
