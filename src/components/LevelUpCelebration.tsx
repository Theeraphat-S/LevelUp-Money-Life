import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, Trophy } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface LevelUpCelebrationProps {
  isOpen: boolean;
  level: number;
  rankKey: string;
  onClose: () => void;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  isOpen,
  level,
  rankKey,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-500/30 bg-[var(--color-surface)] p-6 text-center shadow-2xl z-10"
          >
            {/* 1px Inner Liquid Glass Highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

            {/* Background Glow */}
            <div className="pointer-events-none absolute -inset-x-20 -top-20 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg"
            >
              <Trophy size={36} weight="fill" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <Sparkle size={13} weight="fill" className="text-emerald-500 dark:text-emerald-400" />
                {t("levelUpModal.title")}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
                {t("levelUpModal.subtitle", { level })}
              </h2>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)] font-medium">
                {t("levelUpModal.newRank", { rank: t(rankKey) })}
              </p>
            </motion.div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-950 dark:bg-emerald-500 py-3 text-xs font-bold text-white dark:text-zinc-950 shadow-md transition hover:bg-zinc-800 dark:hover:bg-emerald-400 active:scale-[0.98]"
              >
                {t("levelUpModal.continue")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
