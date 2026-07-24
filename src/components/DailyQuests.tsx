import { CalendarPlus, CheckCircle2, Circle } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Quest } from "../types";

export function DailyQuests({ quests, setQuests }: { quests: Quest[]; setQuests: Dispatch<SetStateAction<Quest[]>> }) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysQuests = quests.filter((quest) => quest.date === today);
  const xp = todaysQuests.filter((quest) => quest.done).reduce((sum, quest) => sum + quest.xp, 0);

  const addQuest = () => {
    setQuests((items) => [{ id: crypto.randomUUID(), title: "Plan tomorrow's budget", date: today, xp: 15, done: false }, ...items]);
  };

  const toggleQuest = (id: string) => {
    setQuests((items) => items.map((quest) => (quest.id === id ? { ...quest, done: !quest.done } : quest)));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Daily Quests</h2>
          <p className="text-sm text-slate-300">เควสประจำวัน วางแผนล่วงหน้าได้</p>
        </div>
        <div className="rounded-xl bg-blue-500 px-3 py-2 text-sm font-bold">{xp} XP</div>
      </div>
      <div className="space-y-2">
        {quests.map((quest) => (
          <button key={quest.id} onClick={() => toggleQuest(quest.id)} className="flex w-full items-center justify-between rounded-xl bg-white/8 px-3 py-3 text-left transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <span className="flex items-center gap-3">
              {quest.done ? <CheckCircle2 className="text-emerald-300" size={20} /> : <Circle className="text-slate-400" size={20} />}
              <span>
                <span className={quest.done ? "font-medium text-slate-300 line-through" : "font-medium text-white"}>{quest.title}</span>
                <span className="block text-xs text-slate-400">{quest.date}</span>
              </span>
            </span>
            <span className="text-sm font-semibold text-blue-200">+{quest.xp}</span>
          </button>
        ))}
      </div>
      <button onClick={addQuest} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-300">
        <CalendarPlus size={16} /> Add quest
      </button>
    </section>
  );
}
