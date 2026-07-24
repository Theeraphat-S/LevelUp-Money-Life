import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Circle, Plus, Trash } from "@phosphor-icons/react";
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

  const addQuest = () => setQuests((items) => [{ id: crypto.randomUUID(), title: t("quests.newDefault", "New daily habit"), date: today, xp: 15, done: false }, ...items]);
  const toggleQuest = (id: string) => setQuests((items) => items.map((q) => (q.id === id ? { ...q, done: !q.done } : q)));
  const deleteQuest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuests((items) => items.filter((q) => q.id !== id));
  };

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[oklch(20%_0.012_260)] text-[oklch(96%_0.005_260)] shadow-[0_28px_56px_-24px_oklch(18%_0.02_260_/_0.6)] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{t("quests.title")}</h2>
          <p className="text-sm text-[oklch(78%_0.01_260)]">{t("quests.subtitle")}</p>
        </div>
        <XpPulse xp={xp} />
      </div>

      <div className="space-y-2.5 p-6">
        <AnimatePresence initial={false}>
          {ordered.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={() => toggleQuest(quest.id)}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.08] focus-within:ring-2 focus-within:ring-[oklch(72%_0.15_165)]"
            >
              <div className="flex items-center gap-3">
                <motion.div whileTap={{ scale: 0.85 }}>
                  {quest.done ? (
                    <CheckCircle size={22} weight="fill" className="text-[oklch(75%_0.16_165)]" />
                  ) : (
                    <Circle size={22} weight="duotone" className="text-[oklch(70%_0.01_260)]" />
                  )}
                </motion.div>
                <div>
                  <span className={`block text-sm font-medium transition-all ${quest.done ? "text-[oklch(65%_0.01_260)] line-through" : "text-white"}`}>{quest.title}</span>
                  <span className="block font-mono text-[11px] text-[oklch(72%_0.01_260)]">{quest.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[oklch(80%_0.14_165)]">+{quest.xp}</span>
                <button
                  onClick={(e) => deleteQuest(quest.id, e)}
                  className="rounded-lg p-1.5 text-[oklch(60%_0.01_260)] transition hover:bg-rose-500/20 hover:text-rose-300"
                  aria-label={t("quests.delete", "Delete quest")}
                >
                  <Trash size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {quests.length === 0 && <p className="rounded-2xl bg-white/[0.04] px-4 py-6 text-center text-sm text-[oklch(78%_0.01_260)]">{t("quests.empty")}</p>}
      </div>

      <div className="border-t border-white/5 px-6 py-4">
        <button onClick={addQuest} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[oklch(96%_0.005_260)] transition active:translate-y-px hover:bg-white/[0.06] focus:outline-none focus-visible:shadow-[0_0_0_2px_oklch(72%_0.15_165_/_0.6)]">
          <Plus size={15} weight="bold" /> {t("quests.add")}
        </button>
      </div>
    </section>
  );
}
