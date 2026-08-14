import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface BentoCardProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  header,
  footer,
  noPadding = false,
  ...motionProps
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-tile)] transition-shadow duration-300 hover:shadow-[var(--shadow-diffuse)] ${className}`}
      {...motionProps}
    >
      {/* 1px Inner Refraction Top Border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

      {header && (
        <div className="border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-5 py-3.5 sm:px-6 sm:py-4">
          {header}
        </div>
      )}

      <div className={noPadding ? "" : "p-5 sm:p-6"}>{children}</div>

      {footer && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </motion.section>
  );
};
