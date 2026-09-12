'use client';

import React from 'react';
import { ProfitAndLossSummary } from '@messmitra/types';
import { BarChart3, PieChart, TrendingUp, DollarSign, Sparkles } from 'lucide-react';

interface PnLChartsProps {
  pnlData: ProfitAndLossSummary;
}

export const PnLCharts: React.FC<PnLChartsProps> = ({ pnlData }) => {
  const breakdown = Object.entries(pnlData.expenseBreakdownByCategory).filter(
    ([_, amount]) => amount > 0
  );

  const totalExpense = pnlData.totalExpenses || 1;
  const totalRevenue = pnlData.totalDuesCollected || 1;

  // Mock past 3 months trend for visual graph comparison
  const monthlyTrends = [
    { month: 'Jul 2026', revenue: 24500, expenses: 21800, profit: 2700 },
    { month: 'Aug 2026', revenue: 28800, expenses: 23400, profit: 5400 },
    {
      month: 'Sep 2026 (Current)',
      revenue: pnlData.totalDuesCollected,
      expenses: pnlData.totalExpenses,
      profit: pnlData.netProfit,
    },
  ];

  const maxVal = Math.max(...monthlyTrends.map((m) => Math.max(m.revenue, m.expenses)), 40000);

  const colors = [
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#eab308', // Yellow
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#64748b', // Slate
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Monthly Revenue vs Expense Comparative Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              मासिक उत्पन्न विरुद्ध खर्च आलेख (Trend Comparison)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">३ महिन्यांचा आढावा</span>
        </div>

        {/* SVG Bars */}
        <div className="h-48 flex items-end justify-around gap-4 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {monthlyTrends.map((item, idx) => {
            const revHeight = Math.max(10, Math.round((item.revenue / maxVal) * 150));
            const expHeight = Math.max(10, Math.round((item.expenses / maxVal) * 150));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[90px]">
                <div className="flex items-end gap-1.5 h-36">
                  {/* Revenue Bar */}
                  <div className="flex flex-col items-center">
                    <div
                      style={{ height: `${revHeight}px` }}
                      className="w-4 sm:w-5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-500 shadow-sm"
                      title={`Revenue: ₹${item.revenue}`}
                    />
                  </div>

                  {/* Expense Bar */}
                  <div className="flex flex-col items-center">
                    <div
                      style={{ height: `${expHeight}px` }}
                      className="w-4 sm:w-5 bg-gradient-to-t from-red-600 to-orange-400 rounded-t-md transition-all duration-500 shadow-sm"
                      title={`Expenses: ₹${item.expenses}`}
                    />
                  </div>
                </div>

                <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center font-medium truncate w-full">
                  {item.month.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <span className="text-slate-700 dark:text-slate-300">एकूण जमा (Revenue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className="text-slate-700 dark:text-slate-300">एकूण खर्च (Expenses)</span>
          </div>
        </div>
      </div>

      {/* 2. Expense Category Proportional Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              खर्चाचे वर्गीकरण व टक्केवारी (Expense Distribution)
            </h4>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            एकूण: ₹{pnlData.totalExpenses.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Category Visual Bars */}
        <div className="space-y-3 my-auto">
          {breakdown.map(([cat, amount], i) => {
            const percentage = Math.round((amount / totalExpense) * 100);
            const color = colors[i % colors.length];

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{cat}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    ₹{amount.toLocaleString('en-IN')}{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">({percentage}%)</strong>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
          💡 टीप: भाजीपाला व किराणा खर्चावर नियंत्रण ठेवल्यास नफ्यात वाढ होते.
        </div>
      </div>
    </div>
  );
};
