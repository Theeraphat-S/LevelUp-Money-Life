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
import { Transaction, CATEGORY_COLORS, CHART_PALETTE, TransactionCategory } from "../types";
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

  const chartData = Object.entries(categoryTotals).map(([category, amount], index) => ({
    name: t(`category.${category}`, category),
    rawCategory: category as TransactionCategory,
    amount,
    color: CATEGORY_COLORS[category as TransactionCategory] || CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  chartData.sort((a, b) => b.amount - a.amount);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)] flex items-center gap-2">
          {t("summary.spendingAnalytics")}
        </h3>
        <div className="flex gap-1 bg-[var(--color-surface-subtle)] border border-[var(--color-line)] p-1 rounded-xl">
          <button
            onClick={() => setChartType("donut")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "donut"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-line)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            <PieIcon size={14} />
            {t("summary.viewDonut")}
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "bar"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-line)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
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
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-line)",
                  borderRadius: "12px",
                  color: "var(--color-ink)",
                  boxShadow: "var(--shadow-tile)",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
                itemStyle={{ color: "var(--color-ink)" }}
                labelStyle={{ color: "var(--color-ink)", fontWeight: "bold" }}
              />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="name" stroke="var(--color-ink-soft)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--color-ink-soft)" fontSize={12} tickLine={false} tickFormatter={(v) => formatMoney(v)} />
              <Tooltip
                formatter={(value: any) => [formatMoney(Number(value || 0)), t("summary.spent")]}
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-line)",
                  borderRadius: "12px",
                  color: "var(--color-ink)",
                  boxShadow: "var(--shadow-tile)",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
                itemStyle={{ color: "var(--color-ink)" }}
                labelStyle={{ color: "var(--color-ink)", fontWeight: "bold" }}
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
