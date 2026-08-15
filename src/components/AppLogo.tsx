import React from "react";
import { motion } from "framer-motion";

export interface AppLogoProps {
  variant?: "icon" | "full" | "monogram";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 28, textClass: "text-lg", subClass: "text-[10px]" },
  md: { icon: 40, textClass: "text-xl sm:text-2xl", subClass: "text-xs" },
  lg: { icon: 52, textClass: "text-3xl", subClass: "text-sm" },
  xl: { icon: 68, textClass: "text-4xl", subClass: "text-base" },
};

export const AppLogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="LevelUp Money Life Logo"
    >
      <defs>
        {/* Background Gradients */}
        <linearGradient id="lml-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1C5954" />
          <stop offset="60%" stopColor="#0D2927" />
          <stop offset="100%" stopColor="#071B1A" />
        </linearGradient>

        <linearGradient id="lml-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8BB999" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#4D8E75" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1C5954" stopOpacity="0.6" />
        </linearGradient>

        {/* Level Up Chevrons */}
        <linearGradient id="lml-chevron-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8BB999" />
          <stop offset="100%" stopColor="#4D8E75" />
        </linearGradient>

        <linearGradient id="lml-chevron-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4D8E75" />
          <stop offset="100%" stopColor="#1C5954" />
        </linearGradient>

        {/* Gold Coin / Star Accent */}
        <linearGradient id="lml-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E4B5" />
          <stop offset="40%" stopColor="#D7AE68" />
          <stop offset="100%" stopColor="#C99A4B" />
        </linearGradient>

        <linearGradient id="lml-glow-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#4D8E75" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1C5954" stopOpacity="0" />
        </linearGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id="lml-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id="lml-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#C99A4B" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Main Outer Squircle Container */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="26"
        fill="url(#lml-bg-grad)"
        stroke="url(#lml-border-grad)"
        strokeWidth="2"
      />

      {/* Radial Glow Highlight */}
      <circle cx="50" cy="45" r="32" fill="url(#lml-glow-grad)" />

      {/* 1px Liquid Glass Top Edge */}
      <path
        d="M 28 5 Q 50 4 72 5"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Lower Chevron (Growth Layer 1) */}
      <path
        d="M 28 66 L 50 48 L 72 66 L 65 72 L 50 59 L 35 72 Z"
        fill="url(#lml-chevron-bottom)"
        opacity="0.85"
      />

      {/* Upper Chevron (Growth Layer 2 - Level Up Apex) */}
      <path
        d="M 32 50 L 50 34 L 68 50 L 62 55 L 50 44 L 38 55 Z"
        fill="url(#lml-chevron-top)"
        filter="url(#lml-shadow)"
      />

      {/* Ascending Money Diamond / Crystal Crest */}
      <g filter="url(#lml-gold-glow)">
        <polygon
          points="50,16 60,26 50,36 40,26"
          fill="url(#lml-gold-grad)"
          stroke="#F5E4B5"
          strokeWidth="1"
        />
        {/* Inner Diamond Shimmer */}
        <polygon
          points="50,20 56,26 50,32 44,26"
          fill="#ffffff"
          opacity="0.65"
        />
      </g>

      {/* Micro Sparkle Stars */}
      <path
        d="M 74 24 Q 74 29 78 29 Q 74 29 74 34 Q 74 29 70 29 Q 74 29 74 24 Z"
        fill="#D7AE68"
        opacity="0.9"
      />
      <circle cx="25" cy="38" r="1.5" fill="#8BB999" opacity="0.8" />
    </svg>
  );
};

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = "full",
  size = "md",
  showText = true,
  animated = true,
  className = "",
}) => {
  const currentSize = sizeMap[size];

  const logoIcon = (
    <AppLogoIcon size={currentSize.icon} className="transition-transform duration-200" />
  );

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.06, rotate: 1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="cursor-pointer"
        >
          {logoIcon}
        </motion.div>
      ) : (
        logoIcon
      )}

      {(variant === "full" || showText) && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight text-[var(--color-ink)] ${currentSize.textClass} leading-tight font-sans`}
            >
              Level<span className="text-[var(--jade-ink)] dark:text-[var(--jade)]">Up</span>
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-xs" />
          </div>
          <span
            className={`font-semibold tracking-wide uppercase text-[var(--color-ink-soft)] ${currentSize.subClass} leading-none mt-0.5`}
          >
            Money Life
          </span>
        </div>
      )}
    </div>
  );

  return content;
};
