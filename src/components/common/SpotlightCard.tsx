import React, { useRef, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  enableGlow?: boolean;
  enableLift?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(28, 89, 84, 0.07)",
  enableGlow = true,
  enableLift = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableGlow || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={
        enableLift && !shouldReduceMotion
          ? { y: -2 }
          : undefined
      }
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-tile)] transition-shadow duration-300 hover:shadow-[var(--shadow-diffuse)] ${className}`}
      {...props}
    >
      {/* 1px Inner Refraction Top Border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

      {/* Dynamic Cursor Spotlight Effect */}
      {enableGlow && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out z-0"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
