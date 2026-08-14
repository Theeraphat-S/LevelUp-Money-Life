import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUUpLeft,
  CheckCircle,
  Circle,
  Fire,
  Lock,
  Plus,
  Sparkle,
  Trash,
  Trophy,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { BentoCard } from "../common/BentoCard";
import type { Achievement, GamificationState, Quest } from "../../types";

interface QuestsGrowthProps {
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  gamification: GamificationState;
  achievements: Achievement[];
  onToggleQuest: (id: string) => void;
}

const RANKS = [
  { level: 1, rankKey: "rank.novice" },
  { level: 3, rankKey: "rank.tactician" },
  { level: 6, rankKey: "rank.strategist" },
  { level: 10, rankKey: "rank.guardian" },
  { level: 15, rankKey: "rank.sovereign" },
  { level: 20, rankKey: "rank.maestro" },
];

export const QuestsGrowth: React.FC<QuestsGrowthProps> = ({
  quests,
  setQuests,
  gamification,
  achievements,
  onToggleQuest,
}) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);

  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<Quest | null>(null);

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;

    const newQ: Quest = {
      id: crypto.randomUUID(),
      title: newQuestTitle.trim(),
      date: today,
      xp: 20,
      done: false,
    };

    setQuests((prev) => [newQ, ...prev]);
    setNewQuestTitle("");
    setIsAdding(false);
  };

  const deleteQuest = (quest: Quest) => {
    setLastDeleted(quest);
    setQuests((prev) => prev.filter((q) => q.id !== quest.id));
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    setQuests((prev) => [lastDeleted, ...prev.filter((q) => q.id !== lastDeleted.id)]);
    setLastDeleted(null);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Top Streak & Gamification Banner */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Streak Flame Banner (5 cols) */}
        <BentoCard className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-[var(--color-surface)] to-[var(--color-surface)]">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-sm">
              <Fire size={32} weight="fill" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Discipline Streak
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                {t("quests.streakTitle", { days: gamification.streakDays })}
              </h2>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)] leading-relaxed">
                {t("quests.streakSubtitle")}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Level Roadmap Overview (7 cols) */}
        <BentoCard
          className="lg:col-span-7"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-[var(--color-ink)]">
                  {t("quests.roadmapTitle")}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Level {gamification.level}
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RANKS.map((r) => {
              const isPassed = gamification.level >= r.level;

              return (
                <div
                  key={r.level}
                  className={`rounded-xl border p-2.5 transition ${
                    isPassed
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300"
                      : "border-[var(--color-line)] bg-[var(--color-surface-subtle)] text-[var(--color-ink-soft)] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                    <span>Lv. {r.level}+</span>
                    {isPassed ? (
                      <CheckCircle size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock size={12} />
                    )}
                  </div>
                  <div className="mt-1 text-xs font-semibold truncate">
                    {t(r.rankKey)}
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>
      </div>

      {/* Daily Quests Management */}
      <BentoCard
        header={
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                {t("quests.title")}
              </h3>
              <p className="text-xs text-[var(--color-ink-soft)]">
                {t("quests.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 dark:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-emerald-400 transition shadow-xs"
            >
              <Plus size={14} weight="bold" />
              <span>{t("quests.add")}</span>
            </button>
          </div>
        }
      >
        <AnimatePresence>
          {lastDeleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 rounded-xl"
            >
              <span>{t("quests.deleted")}</span>
              <button
                type="button"
                onClick={undoDelete}
                className="inline-flex items-center gap-1 font-bold text-amber-950 dark:text-amber-300 underline hover:no-underline"
              >
                <ArrowUUpLeft size={14} /> {t("quests.undo")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isAdding && (
          <form onSubmit={handleAddQuest} className="mb-4 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. Save 100 THB into piggy bank"
              value={newQuestTitle}
              onChange={(e) => setNewQuestTitle(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-emerald-500 shadow-xs"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Save Quest
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)]"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="space-y-2.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                quest.done
                  ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-400 dark:text-zinc-500"
                  : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleQuest(quest.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                {quest.done ? (
                  <CheckCircle size={22} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Circle size={22} weight="duotone" className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                )}
                <div>
                  <span
                    className={`block text-xs font-semibold ${
                      quest.done ? "line-through text-zinc-400 dark:text-zinc-500" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {quest.title}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-ink-soft)]">
                    {quest.date}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2 pl-2">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <Sparkle size={12} weight="fill" /> +{quest.xp} XP
                </span>
                <button
                  type="button"
                  onClick={() => deleteQuest(quest)}
                  className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}

          {quests.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--color-ink-soft)]">
              {t("quests.empty")}
            </div>
          )}
        </div>
      </BentoCard>

      {/* Trophies & Financial Milestones */}
      <BentoCard
        header={
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                {t("quests.achievementsTitle")}
              </h3>
              <p className="text-xs text-[var(--color-ink-soft)]">
                Unlock permanent financial trophies as your habits grow.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              {t("quests.unlockedCount", {
                unlocked: unlockedCount,
                total: achievements.length,
              })}
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`rounded-2xl border p-4 transition ${
                  ach.unlocked
                    ? "border-emerald-500/30 bg-emerald-500/5 shadow-xs"
                    : "border-[var(--color-line)] bg-[var(--color-surface-subtle)] opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl border text-base ${
                      ach.unlocked
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]"
                    }`}
                  >
                    <Trophy size={18} weight={ach.unlocked ? "fill" : "duotone"} />
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[var(--color-ink)]">
                    {t(ach.titleKey)}
                  </h4>
                  <p className="mt-1 text-[11px] text-[var(--color-ink-soft)] leading-relaxed">
                    {t(ach.descKey)}
                  </p>
                </div>

                <div className="mt-3 border-t border-[var(--color-line)] pt-2 text-[10px] text-[var(--color-ink-faint)] font-mono">
                  {ach.unlocked ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      {t("quests.unlockedAt", { date: ach.unlockedAt || today })}
                    </span>
                  ) : (
                    <span>{t("quests.locked")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </BentoCard>
    </div>
  );
};
