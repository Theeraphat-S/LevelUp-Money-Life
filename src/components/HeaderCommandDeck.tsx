import React from "react";
import { motion } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  Database,
  Desktop,
  Fire,
  Moon,
  Plus,
  Sun,
  Trophy,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { GamificationState, ThemeMode, ViewTab } from "../types";

interface HeaderCommandDeckProps {
  gamification: GamificationState;
  activeMonth: string; // "YYYY-MM"
  setActiveMonth: (month: string) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenQuickAdd: () => void;
  onOpenDataManager: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const HeaderCommandDeck: React.FC<HeaderCommandDeckProps> = ({
  gamification,
  activeMonth,
  setActiveMonth,
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenDataManager,
  themeMode,
  setThemeMode,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("th") ? "th" : "en";
  const currentMonthISO = new Date().toISOString().slice(0, 7);

  const prevMonth = () => {
    const [yearStr, monthStr] = activeMonth.split("-");
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setActiveMonth(`${y}-${String(m).padStart(2, "0")}`);
  };

  const nextMonth = () => {
    const [yearStr, monthStr] = activeMonth.split("-");
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setActiveMonth(`${y}-${String(m).padStart(2, "0")}`);
  };

  // Format Month Year nicely for display
  const monthDate = new Date(`${activeMonth}-01T00:00:00`);
  const formattedMonth = monthDate.toLocaleDateString(currentLang === "th" ? "th-TH" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const levelProgressPct = Math.min(
    100,
    Math.round((gamification.currentLevelXp / gamification.xpForNextLevel) * 100)
  );

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "dashboard", label: t("tabs.dashboard") },
    { id: "ledger", label: t("tabs.ledger") },
    { id: "budget", label: t("tabs.budget") },
    { id: "analytics", label: t("tabs.analytics") },
    { id: "quests", label: t("tabs.quests") },
  ];

  const themeOptions: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: "light", icon: <Sun size={15} weight="bold" />, label: t("theme.light") },
    { mode: "dark", icon: <Moon size={15} weight="bold" />, label: t("theme.dark") },
    { mode: "system", icon: <Desktop size={15} weight="bold" />, label: t("theme.system") },
  ];

  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6 shadow-[var(--shadow-tile)] transition-all duration-300">
      {/* 1px Liquid Glass Highlight at the very top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

      {/* Top Utility Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--color-line)] pb-5">
        {/* Left: Branding & Level Gamification Banner */}
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            {/* Level & Rank Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <Trophy size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
              <span>
                {t("header.levelBadge", {
                  level: gamification.level,
                  rank: t(gamification.titleRankKey),
                })}
              </span>
            </div>

            {/* Streak Counter Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-xs">
              <Fire size={14} weight="fill" className="text-amber-600 dark:text-amber-400" />
              <span>{t("header.streakBadge", { days: gamification.streakDays })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
                {t("app.title")}
              </h1>
              <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                {t("app.subtitle")}
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-[11px] font-medium text-[var(--color-ink-soft)]">
              <span>{t("rank." + gamification.titleRankKey.replace("rank.", ""))}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {t("header.xpProgress", {
                  current: gamification.currentLevelXp,
                  next: gamification.xpForNextLevel,
                })}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Right: Month Selector, Theme Switcher, Quick Actions & Language */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
          {/* Month Switcher */}
          <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-1 shadow-xs">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-[var(--color-ink-soft)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
              aria-label="Previous Month"
            >
              <CaretLeft size={16} weight="bold" />
            </button>

            <span className="min-w-[120px] text-center text-xs font-semibold text-[var(--color-ink)] px-2">
              {formattedMonth}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-[var(--color-ink-soft)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
              aria-label="Next Month"
            >
              <CaretRight size={16} weight="bold" />
            </button>

            {activeMonth !== currentMonthISO && (
              <button
                type="button"
                onClick={() => setActiveMonth(currentMonthISO)}
                className="ml-1 rounded-md bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {t("header.currentMonth")}
              </button>
            )}
          </div>

          {/* Theme Switcher Segmented Pill */}
          <div
            className="inline-flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-0.5 shadow-xs"
            role="radiogroup"
            aria-label={t("theme.title")}
          >
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setThemeMode(opt.mode)}
                  title={`${t("theme.title")}: ${opt.label}`}
                  aria-label={`${t("theme.title")}: ${opt.label}`}
                  aria-checked={isSelected}
                  role="radio"
                  className={`relative flex items-center justify-center rounded-lg p-1.5 text-xs transition-colors duration-200 ${
                    isSelected
                      ? "text-zinc-950 dark:text-white"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="themePillIndicator"
                      className="absolute inset-0 rounded-lg bg-[var(--color-surface)] shadow-xs border border-[var(--color-line)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{opt.icon}</span>
                </button>
              );
            })}
          </div>

          {/* Language Switcher */}
          <div className="inline-flex rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-0.5 shadow-xs">
            {(["en", "th"] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  currentLang === lng
                    ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t(`lang.${lng}`)}
              </button>
            ))}
          </div>

          {/* Data Manager Trigger */}
          <button
            type="button"
            onClick={onOpenDataManager}
            title={t("header.dataManager")}
            aria-label={t("header.dataManager")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] active:scale-[0.98] shadow-xs"
          >
            <Database size={15} weight="duotone" />
            <span className="hidden sm:inline">{t("header.dataManager")}</span>
          </button>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 dark:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white dark:text-zinc-950 transition hover:bg-zinc-800 dark:hover:bg-emerald-400 active:scale-[0.98] shadow-xs"
          >
            <Plus size={15} weight="bold" className="text-emerald-400 dark:text-zinc-950" />
            <span>{t("header.quickAdd")}</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav Tabs */}
      <nav className="mt-4 flex overflow-x-auto pb-1 gap-1.5 no-scrollbar" aria-label="Main Navigation">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm"
                  : "bg-[var(--color-surface-subtle)] text-[var(--color-ink-soft)] hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
