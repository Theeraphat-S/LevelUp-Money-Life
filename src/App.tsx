import { motion } from "framer-motion";
import { CalendarDots, ChartLineUp, Coins, ShieldCheck, Trophy } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { DailyQuests } from "./components/DailyQuests";
import { ExpenseTable } from "./components/ExpenseTable";
import { FinancialPlan } from "./components/FinancialPlan";
import { SummaryStats } from "./components/SummaryStats";
import { useLocalStorage } from "./hooks/useLocalStorage";
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
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("levelup.transactions", sampleTransactions);
  const [allocations, setAllocations] = useLocalStorage<Allocation[]>("levelup.allocations", sampleAllocations);
  const [income, setIncome] = useLocalStorage<number>("levelup.income", 42000);
  const [quests, setQuests] = useLocalStorage<Quest[]>("levelup.quests", sampleQuests);

  const expenses = Math.abs(transactions.filter((row) => row.date.startsWith(month) && row.amount < 0).reduce((sum, row) => sum + row.amount, 0));
  const cleared = transactions.filter((row) => row.cleared).length;
  const xpEarned = quests.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const xpGoal = 200;
  const levelPct = Math.min(100, Math.round((xpEarned / xpGoal) * 100));

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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-accent-ink)] shadow-[var(--shadow-tile)]">
              <Trophy size={15} weight="fill" />
              {t("level", { level: 12 })}
              <span className="font-mono text-[var(--color-ink-soft)]">{t("xp", { earned: xpEarned, goal: xpGoal })}</span>
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

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-end lg:w-[34rem]">
            <LanguageToggle />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:flex-1">
              <Metric icon={<Coins size={18} weight="duotone" />} label={t("metric.spent")} value={`฿${thb.format(expenses)}`} />
              <Metric icon={<ShieldCheck size={18} weight="duotone" />} label={t("metric.cleared")} value={`${cleared}/${transactions.length}`} />
              <Metric icon={<ChartLineUp size={18} weight="duotone" />} label={t("metric.net")} value={`฿${thb.format(income - expenses)}`} />
            </div>
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
          <span className="font-mono">v0.1.0 · local-first</span>
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
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${current === lng ? "bg-[var(--color-ink)] text-[var(--color-surface)]" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"}`}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-tile)]">
      <div className="flex items-center gap-2 text-[var(--color-accent)]">{icon}<span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">{label}</span></div>
      <div className="mt-1.5 font-mono text-xl font-semibold tracking-tight text-[var(--color-ink)]">{value}</div>
    </div>
  );
}

function NextMonthPrep() {
  const { t } = useTranslation();
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-diffuse)]">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]">
          <CalendarDots size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("prep.title")}</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">{t("prep.subtitle")}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-[var(--color-ink-soft)]">
        <li className="flex items-center gap-2 rounded-xl bg-[var(--color-base)] px-3 py-2.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> {t("prep.i1")}</li>
        <li className="flex items-center gap-2 rounded-xl bg-[var(--color-base)] px-3 py-2.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> {t("prep.i2")}</li>
        <li className="flex items-center gap-2 rounded-xl bg-[var(--color-base)] px-3 py-2.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> {t("prep.i3")}</li>
      </ul>
    </section>
  );
}
