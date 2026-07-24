import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Transaction, TransactionCategory } from "../types";

const categories: TransactionCategory[] = ["Income", "Food", "Transport", "Home", "Health", "Learning", "Fun", "Debt", "Savings"];

export function ExpenseTable({ transactions, setTransactions }: { transactions: Transaction[]; setTransactions: Dispatch<SetStateAction<Transaction[]>> }) {
  const addRow = () => {
    setTransactions((rows) => [
      { id: crypto.randomUUID(), name: "New expense", amount: -100, date: new Date().toISOString().slice(0, 10), category: "Food", cleared: false },
      ...rows,
    ]);
  };

  const updateRow = (id: string, patch: Partial<Transaction>) => {
    setTransactions((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const deleteRow = (id: string) => {
    setTransactions((rows) => rows.filter((row) => row.id !== id));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Daily Money Log</h2>
          <p className="text-sm text-slate-600">รายรับรายจ่ายรายวัน พร้อมเก็บย้อนหลัง</p>
        </div>
        <button onClick={addRow} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={16} /> Add row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Cleared</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><input value={row.name} onChange={(e) => updateRow(row.id, { name: e.target.value })} className="w-52 rounded-lg border border-transparent bg-transparent px-2 py-1 text-slate-900 outline-none focus:border-blue-400" /></td>
                <td className="px-4 py-3"><input type="number" value={row.amount} onChange={(e) => updateRow(row.id, { amount: Number(e.target.value) })} className="w-28 rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium text-slate-900 outline-none focus:border-blue-400" /></td>
                <td className="px-4 py-3"><input type="date" value={row.date} onChange={(e) => updateRow(row.id, { date: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700" /></td>
                <td className="px-4 py-3"><select value={row.category} onChange={(e) => updateRow(row.id, { category: e.target.value as TransactionCategory })} className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700">{categories.map((category) => <option key={category}>{category}</option>)}</select></td>
                <td className="px-4 py-3"><input type="checkbox" checked={row.cleared} onChange={(e) => updateRow(row.id, { cleared: e.target.checked })} className="h-4 w-4 accent-blue-700" /></td>
                <td className="px-4 py-3 text-right"><button onClick={() => deleteRow(row.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Delete transaction"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
