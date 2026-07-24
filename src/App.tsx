import { BarChart3, CalendarDays, Coins, ShieldCheck, Trophy } from "lucide-react";
import { DailyQuests } from "./components/DailyQuests";
import { ExpenseTable } from "./components/ExpenseTable";
import { FinancialPlan } from "./components/FinancialPlan";
import { SummaryStats } from "./components/SummaryStats";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Allocation, Quest, Transaction } from "./types";

const today = new Date().toISOString().slice(0, 10);
const month = today.slice(0, 7);

const sampleTransactions: Transaction[] = [
  { id: "t1", name: "Salary", amount: 32000, date: `${month}-01`, category: "Income", cleared: true },
  { id: "t2", name: "Lunch", amount: -120, date: today, category: "Food", cleared: true },
  { id: "t3", name: "BTS", amount: -62, date: today, category: "Transport", cleared: true },
  { id: "t4", name: "Online course", amount: -790, date: `${month}-08`, category: "Learning", cleared: false },
  { id: "t5", name: "Emergency fund", amount: -3000, date: `${month}-10`, category: "Savings", cleared: true },
];

const sampleAllocations: Allocation[] = [
  { id: "needs", label: "Needs", percent: 50, color: "#003f5c" },
  { id: "wants", label: "Wants", percent: 30, color: "#665191" },
  { id: "savings", label: "Savings", percent: 20, color: "#ffa600" },
];

const sampleQuests: Quest[] = [
  { id: "q1", title: "Log all spending today", date: today, xp: 10, done: false },
  { id: "q2", title: "No impulse purchase", date: today, xp: 20, done: false },
  { id: "q3", title: "Check monthly budget plan", date: today, xp: 15, done: true },
];

export default function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("levelup.transactions", sampleTransactions);
  const [allocations, setAllocations] = useLocalStorage<Allocation[]>("levelup.allocations", sampleAllocations);
  const [income, setIncome] = useLocalStorage<number>("levelup.income", 32000);

  const [quests, setQuests] = useLocalStorage<Quest[]>("levelup.quests", sampleQuests);
  const expenses = Math.abs(transactions.filter((row) => row.date.startsWith(month) && row.amount < 0).reduce((sum, row) => sum + row.amount, 0));
  const cleared = transactions.filter((row) => row.cleared).length;

  return (
    <main className="min-h-screen px-5 py-6 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              <Trophy size={16} /> Level 12 · Money Adventurer
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">LevelUp Money Life</h1>
            <p className="mt-1 max-w-2xl text-slate-600">แดชบอร์ดการเงินส่วนตัวที่รวมบันทึกรายวัน สรุปสิ้นเดือน แผนเงินเดือน และเควสสร้างนิสัย</p>
          </div>
          <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-panel">
            <Metric icon={<Coins size={18} />} label="Spent this month" value={`฿${expenses.toLocaleString("th-TH")}`} />
            <Metric icon={<ShieldCheck size={18} />} label="Cleared logs" value={`${cleared}/${transactions.length}`} />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <ExpenseTable transactions={transactions} setTransactions={setTransactions} />
            <FinancialPlan income={income} setIncome={setIncome} allocations={allocations} setAllocations={setAllocations} />
          </div>
          <aside className="space-y-5">
            <SummaryStats transactions={transactions} month={month} />
            <DailyQuests quests={quests} setQuests={setQuests} />
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-800"><CalendarDays size={20} /></div>
                <div>
                  <h2 className="font-semibold text-slate-950">Next month prep</h2>
                  <p className="text-sm text-slate-600">Review categories before salary day.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <BarChart3 size={16} className="text-blue-700" /> Planned vs actual chart ready for next iteration.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-36 rounded-xl bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">{icon}{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}
