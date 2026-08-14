import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Circle, Plus, Trash, ArrowUUpLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import type { Quest } from "../types";

const XpPulse = memo(function XpPulse({ xp }: { xp: number }) {
  return (
    <span className="relative inline-flex">
      <motion.span
        className="absolute inset-0 rounded-full bg-[oklch(72%_0.15_165)]"
        animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative rounded-full bg-[oklch(72%_0.15_165)] px-3 py-1.5 font-mono text-xs font-bold text-[oklch(18%_0.02_165)] shadow-sm">
        {xp} XP
      </span>
    </span>
  );
});

export function DailyQuests({ quests, setQuests }: { quests: Quest[]; setQuests: Dispatch<SetStateAction<Quest[]>> }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const xp = quests.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const ordered = [...quests].sort((a, b) => Number(a.done) - Number(b.done));
  const [lastDeleted, setLastDeleted] = useState<Quest | null>(null);

  const addQuest = () => setQuests((items) => [{ id: crypto.randomUUID(), title: t("quests.newDefault"), date: today, xp: 15, done: false }, ...items]);

  const toggleQuest = (id: string) => setQuests((items) => items.map((q) => (q.id === id ? { ...q, done: !q.done } : q)));

  const deleteQuest = (quest: Quest) => {
    setLastDeleted(quest);
    setQuests((items) => items.filter((q) => q.id !== quest.id));
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    setQuests((items) => [lastDeleted, ...items.filter((q) => q.id !== lastDeleted.id)]);
    setLastDeleted(null);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-tile)]">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-6 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--color-ink)]">{t("quests.title")}</h2>
          <p className="text-xs text-[var(--color-ink-soft)]">{t("quests.subtitle")}</p>
        </div>
        <XpPulse xp={xp} />
      </div>

      <AnimatePresence>
        {lastDeleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-6 py-2 text-xs text-amber-800 dark:text-amber-200"
          >
            <span>{t("quests.deleted")}</span>
            <button
              type="button"
              onClick={undoDelete}
              className="inline-flex items-center gap-1 font-semibold text-amber-900 dark:text-amber-300 underline hover:no-underline"
            >
              <ArrowUUpLeft size={14} /> {t("quests.undo")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {ordered.map((quest) => (
              <motion.li
                key={quest.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="group flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-subtle)]"
              >
                <button
                  type="button"
                  onClick={() => toggleQuest(quest.id)}
                  aria-pressed={quest.done}
                  aria-label={t("quests.toggle", { title: quest.title })}
                  className="flex flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-0.5"
                >
                  <motion.div whileTap={{ scale: 0.85 }}>
                    {quest.done ? (
                      <CheckCircle size={20} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle size={20} weight="duotone" className="text-zinc-400 dark:text-zinc-500" />
                    )}
                  </motion.div>
                  <div>
                    <span className={`block text-xs sm:text-sm font-medium transition-all ${quest.done ? "text-zinc-500 dark:text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"}`}>{quest.title}</span>
                    <span className="block font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{quest.date}</span>
                  </div>
                </button>

                <div className="flex items-center gap-2 pl-2">
                  <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">+{quest.xp}</span>
                  <button
                    type="button"
                    onClick={() => deleteQuest(quest)}
                    className="rounded-md p-1 text-zinc-400 dark:text-zinc-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                    aria-label={t("quests.delete")}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {quests.length === 0 && <p className="mt-2 rounded-xl bg-[var(--color-surface-subtle)] px-4 py-5 text-center text-xs text-[var(--color-ink-soft)]">{t("quests.empty")}</p>}
      </div>

      <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-5 py-3">
        <button
          type="button"
          onClick={addQuest}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-subtle)] shadow-xs"
        >
          <Plus size={14} weight="bold" /> {t("quests.add")}
        </button>
      </div>
    </section>
  );
}
