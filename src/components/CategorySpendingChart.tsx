import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Transaction, CATEGORY_COLORS, TransactionCategory } from "../types";
import { PieChart as PieIcon, BarChart2 } from "lucide-react";

interface CategorySpendingChartProps {
  transactions: Transaction[];
  formatMoney: (val: number) => string;
}

export const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({
  transactions,
  formatMoney,
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");

  // Filter out income, only aggregate expenses
  const expenses = transactions.filter(
    (t) => t.category !== "Income" && t.amount > 0
  );

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: t(`category.${category}`, category),
    rawCategory: category as TransactionCategory,
    amount,
    color: CATEGORY_COLORS[category as TransactionCategory] || "oklch(60% 0.12 200)",
  }));

  chartData.sort((a, b) => b.amount - a.amount);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {t("summary.spendingAnalytics")}
        </h3>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setChartType("donut")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "donut"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PieIcon size={14} />
            {t("summary.viewDonut")}
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "bar"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart2 size={14} />
            {t("summary.viewBar")}
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "donut" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatMoney(Number(value || 0)), t("summary.spent")]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(51, 65, 85, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => formatMoney(v)} />
              <Tooltip
                formatter={(value: any) => [formatMoney(Number(value || 0)), t("summary.spent")]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(51, 65, 85, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
