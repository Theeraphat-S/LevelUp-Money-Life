import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDots, ChartLineUp, Coins, ShieldCheck, Trophy } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { DailyQuests } from "./components/DailyQuests";
import { ExpenseTable } from "./components/ExpenseTable";
import { FinancialPlan } from "./components/FinancialPlan";
import { SummaryStats } from "./components/SummaryStats";
import {
  getTransactions,
  saveAllTransactions,
  getAllocations,
  saveAllocations,
  getQuests,
  saveAllQuests,
  getSetting,
  saveSetting,
} from "./services/db";
import type { Allocation, Quest, Transaction } from "./types";

const today = new Date().toISOString().slice(0, 10);
const month = today.slice(0, 7);

const sampleTransactions: Transaction[] = [
  { id: "t1", name: "Salary", amount: 42000, date: `${month}-01`, category: "Income", cleared: true },
  { id: "t2", name: "Lunch — Saneh Jaan", amount: -185, date: today, category: "Food", cleared: true },
  { id: "t3", name: "BTS commute", amount: -74, date: today, category: "Transport", cleared: true },
  { id: "t4", name: "DataCamp subscription", amount: -990, date: `${month}-08`, category: "Learning", cleared: false },
  { id: "t5", name: "Emergency fund", amount: -4200, date: `${month}-10`, category: "Savings", cleared: true },
  { id: "t6", name: "Groceries — Tops", amount: -843, date: `${month}-12`, category: "Food", cleared: true },
];

const sampleAllocations: Allocation[] = [
  { id: "needs", label: "Needs", percent: 50, color: "oklch(58% 0.13 165)" },
  { id: "wants", label: "Wants", percent: 30, color: "oklch(62% 0.11 230)" },
  { id: "savings", label: "Savings", percent: 20, color: "oklch(70% 0.12 80)" },
];

const sampleQuests: Quest[] = [
  { id: "q1", title: "Log every transaction today", date: today, xp: 10, done: false },
  { id: "q2", title: "Skip one impulse purchase", date: today, xp: 20, done: false },
  { id: "q3", title: "Review the monthly budget plan", date: today, xp: 15, done: true },
];

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function tile(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
}

export default function App() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [allocations, setAllocationsState] = useState<Allocation[]>([]);
  const [income, setIncomeState] = useState<number>(42000);
  const [quests, setQuestsState] = useState<Quest[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        let txs = await getTransactions();
        if (txs.length === 0) {
          const localTxs = localStorage.getItem("levelup.transactions");
          txs = localTxs ? JSON.parse(localTxs) : sampleTransactions;
          await saveAllTransactions(txs);
        }

        let allocs = await getAllocations();
        if (allocs.length === 0) {
          const localAllocs = localStorage.getItem("levelup.allocations");
          allocs = localAllocs ? JSON.parse(localAllocs) : sampleAllocations;
          await saveAllocations(allocs);
        }

        let qsts = await getQuests();
        if (qsts.length === 0) {
          const localQuests = localStorage.getItem("levelup.quests");
          qsts = localQuests ? JSON.parse(localQuests) : sampleQuests;
          await saveAllQuests(qsts);
        }

        const localInc = localStorage.getItem("levelup.income");
        const defaultInc = localInc ? JSON.parse(localInc) : 42000;
        const inc = await getSetting<number>("income", defaultInc);
        if (localInc) {
          await saveSetting("income", inc);
        }

        setTransactionsState(txs);
        setAllocationsState(allocs);
        setQuestsState(qsts);
        setIncomeState(inc);
      } catch (err) {
        console.error("Failed loading data from SQLite, fallback to local state", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const setTransactions = (value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactionsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllTransactions(next).catch(console.error);
      return next;
    });
  };

  const setAllocations = (value: Allocation[] | ((prev: Allocation[]) => Allocation[])) => {
    setAllocationsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllocations(next).catch(console.error);
      return next;
    });
  };

  const setQuests = (value: Quest[] | ((prev: Quest[]) => Quest[])) => {
    setQuestsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllQuests(next).catch(console.error);
      return next;
    });
  };

  const setIncome = (value: number | ((prev: number) => number)) => {
    setIncomeState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSetting("income", next).catch(console.error);
      return next;
    });
  };

  const monthRows = transactions.filter((row) => row.date.startsWith(month));
  const monthIncome = monthRows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
  const expenses = Math.abs(
    monthRows
      .filter((row) => row.amount < 0)
      .reduce((sum, row) => sum + row.amount, 0)
  );
  const actualNet = monthIncome - expenses;
  const cleared = transactions.filter((row) => row.cleared).length;
  const xpEarned = quests.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const xpGoal = 200;
  const levelPct = Math.min(100, Math.round((xpEarned / xpGoal) * 100));

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center font-mono text-sm text-[var(--color-ink-soft)]">
          {t("app.loading")}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-accent-ink)] shadow-[var(--shadow-tile)]">
                <Trophy size={15} weight="fill" />
                {t("level", { level: 12 })}
                <span className="font-mono text-[var(--color-ink-soft)]">{t("xp", { earned: xpEarned, goal: xpGoal })}</span>
              </div>
              <LanguageToggle />
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-5xl">
              {t("app.title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base">
              {t("app.subtitle")}
            </p>
            <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-[var(--color-line)]">
              <motion.div
                className="h-full rounded-full bg-[var(--color-accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[33rem]">
            <Metric icon={<Coins size={18} weight="duotone" />} label={t("metric.spent")} value={`฿${thb.format(expenses)}`} />
            <Metric icon={<ShieldCheck size={18} weight="duotone" />} label={t("metric.cleared")} value={`${cleared}/${transactions.length}`} />
            <Metric icon={<ChartLineUp size={18} weight="duotone" />} label={t("metric.net")} value={`${actualNet >= 0 ? "+" : ""}฿${thb.format(actualNet)}`} />
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <motion.div {...tile(0.05)}>
              <ExpenseTable transactions={transactions} setTransactions={setTransactions} />
            </motion.div>
            <motion.div {...tile(0.15)}>
              <FinancialPlan income={income} setIncome={setIncome} allocations={allocations} setAllocations={setAllocations} />
            </motion.div>
            <motion.div {...tile(0.25)}>
              <SummaryStats transactions={transactions} month={month} />
            </motion.div>
          </div>
          <div className="space-y-5 xl:col-span-4">
            <motion.div {...tile(0.1)}>
              <DailyQuests quests={quests} setQuests={setQuests} />
            </motion.div>
            <motion.div {...tile(0.2)}>
              <NextMonthPrep />
            </motion.div>
          </div>
        </div>

        <footer className="mt-8 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
          <span className="font-mono">v0.2.0 · local-first (SQLite)</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDots size={13} /> {today}</span>
        </footer>
      </div>
    </main>
  );
}

function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const current = i18n.language?.startsWith("th") ? "th" : "en";
  return (
    <div className="inline-flex items-center self-end rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-tile)]" role="group" aria-label={t("lang.toggle")}>
      {(["en", "th"] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${current === lng ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 shadow-[var(--shadow-tile)]">
      <div className="flex items-center gap-1.5 text-[var(--color-accent)]">
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-soft)] sm:text-[11px]">{label}</span>
      </div>
      <div className="mt-1.5 font-mono text-xl font-semibold tracking-tight text-[var(--color-ink)] whitespace-nowrap">{value}</div>
    </div>
  );
}

function NextMonthPrep() {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({ i1: false, i2: false, i3: false });

  useEffect(() => {
    getSetting<Record<string, boolean>>("prepChecked", { i1: false, i2: false, i3: false }).then(setCheckedItems);
  }, []);

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveSetting("prepChecked", next).catch(console.error);
      return next;
    });
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[oklch(20%_0.012_260)] p-6 pb-7 text-[oklch(96%_0.005_260)] shadow-[0_28px_56px_-24px_oklch(18%_0.02_260_/_0.6)] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.08] text-[oklch(75%_0.16_165)]">
            <CalendarDots size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t("prep.title")}</h2>
            <p className="text-sm text-[oklch(78%_0.01_260)]">{t("prep.subtitle")}</p>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold text-[oklch(85%_0.14_165)] bg-white/[0.08] border border-white/10 px-3 py-1 rounded-full">
          {completedCount}/3
        </span>
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {(["i1", "i2", "i3"] as const).map((key) => {
          const isDone = !!checkedItems[key];
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => toggleItem(key)}
                aria-pressed={isDone}
                aria-label={t("prep.toggle", { item: t(`prep.${key}`) })}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 px-3.5 py-2.5 text-left transition ${isDone ? "bg-white/[0.08] text-[oklch(75%_0.16_165)]" : "bg-white/[0.04] text-white hover:bg-white/[0.08]"} focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(75%_0.16_165)]`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`h-4 w-4 rounded-md border flex items-center justify-center text-xs transition ${isDone ? "border-[oklch(75%_0.16_165)] bg-[oklch(75%_0.16_165)] text-zinc-950 font-bold" : "border-white/20 bg-transparent text-transparent"}`}>
                    ✓
                  </span>
                  <span className={isDone ? "line-through text-[oklch(65%_0.01_260)]" : "text-white"}>{t(`prep.${key}`)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
