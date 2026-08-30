import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface FloatingRewardItem {
  id: string;
  text: string;
  x?: number;
  y?: number;
  type?: "xp" | "coin" | "badge";
}

interface FloatingRewardProps {
  rewards: FloatingRewardItem[];
  onComplete?: (id: string) => void;
}

export const FloatingReward: React.FC<FloatingRewardProps> = ({
  rewards,
  onComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={
              shouldReduceMotion
                ? { opacity: 0, scale: 0.9 }
                : { opacity: 0, y: reward.y ?? 20, scale: 0.8 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, y: (reward.y ?? 20) - 40, scale: 1.05 }
            }
            exit={{ opacity: 0, y: (reward.y ?? 20) - 70, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => onComplete?.(reward.id)}
            style={{
              left: reward.x ?? "50%",
              top: reward.y ?? "40%",
              transform: "translate(-50%, -50%)",
            }}
            className="absolute flex items-center gap-1.5 rounded-full border border-[var(--jade)]/40 bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--jade-ink)] shadow-[var(--shadow-diffuse)] backdrop-blur-md"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--jade)] animate-ping" />
            <span>{reward.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
