import React from "react";
import { motion } from "framer-motion";

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  tone?: "emerald" | "rose" | "indigo" | "amber" | "neutral";
  className?: string;
  onClick?: () => void;
}

const TONE_STYLES = {
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    valueText: "text-emerald-700",
  },
  rose: {
    iconBg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    valueText: "text-rose-600",
  },
  indigo: {
    iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    valueText: "text-indigo-700",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    valueText: "text-amber-700",
  },
  neutral: {
    iconBg: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
    valueText: "text-[var(--color-ink)]",
  },
};

export const MetricTile: React.FC<MetricTileProps> = ({
  icon,
  label,
  value,
  subtext,
  tone = "neutral",
  className = "",
  onClick,
}) => {
  const styles = TONE_STYLES[tone];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-4.5 shadow-[var(--shadow-tile)] transition-colors hover:border-[var(--color-line-subtle)] hover:bg-[var(--color-surface)] ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
          {label}
        </span>
        <div
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-sm transition-transform duration-200 group-hover:scale-105 ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className={`mt-2 font-mono text-xl sm:text-2xl font-bold tracking-tight ${styles.valueText}`}>
        {value}
      </div>

      {subtext && (
        <div className="mt-1 text-[11px] font-medium text-[var(--color-ink-faint)]">
          {subtext}
        </div>
      )}
    </motion.div>
  );
};
