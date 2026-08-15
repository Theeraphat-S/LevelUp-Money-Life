import React from "react";
import { motion } from "framer-motion";

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  tone?: "jade" | "emerald" | "teal" | "rose" | "indigo" | "amber" | "moss" | "neutral";
  className?: string;
  onClick?: () => void;
}

const TONE_STYLES = {
  jade: {
    iconBg: "bg-[var(--jade-soft)] text-[var(--jade-ink)] border-[var(--jade)]/25",
    valueText: "text-[var(--jade-ink)]",
  },
  emerald: {
    iconBg: "bg-[var(--jade-soft)] text-[var(--jade-ink)] border-[var(--jade)]/25",
    valueText: "text-[var(--jade-ink)]",
  },
  teal: {
    iconBg: "bg-[var(--primary-soft)] text-[var(--primary-ink)] border-[var(--primary)]/25",
    valueText: "text-[var(--primary-ink)]",
  },
  rose: {
    iconBg: "bg-[var(--rose-soft)] text-[var(--rose-ink)] border-[var(--rose)]/25",
    valueText: "text-[var(--rose-ink)]",
  },
  amber: {
    iconBg: "bg-[var(--amber-soft)] text-[var(--amber-ink)] border-[var(--amber)]/25",
    valueText: "text-[var(--amber-ink)]",
  },
  moss: {
    iconBg: "bg-[var(--moss-soft)] text-[var(--moss-ink)] border-[var(--moss)]/25",
    valueText: "text-[var(--moss-ink)]",
  },
  indigo: {
    iconBg: "bg-[var(--moss-soft)] text-[var(--moss-ink)] border-[var(--moss)]/25",
    valueText: "text-[var(--moss-ink)]",
  },
  neutral: {
    iconBg: "bg-[var(--color-surface-subtle)] text-[var(--color-ink-soft)] border-[var(--color-line)]",
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
