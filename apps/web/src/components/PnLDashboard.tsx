'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { ProfitAndLossSummary } from '@messmitra/types';
import { PnLCharts } from './PnLCharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

interface PnLDashboardProps {
  pnlData: ProfitAndLossSummary;
  onMonthChange: (month: string) => void;
  onExportBillingCsv: () => void;
  onExportExpensesCsv: () => void;
}

export const PnLDashboard: React.FC<PnLDashboardProps> = ({
  pnlData,
  onMonthChange,
  onExportBillingCsv,
  onExportExpensesCsv,
}) => {
  const { t } = useI18n();
  const [selectedMonth, setSelectedMonth] = useState(pnlData.month || '2026-09');

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
    onMonthChange(e.target.value);
  };

  const isProfitable = pnlData.netProfit >= 0;
  const expenseBreakdown = Object.entries(pnlData.expenseBreakdownByCategory).filter(
    ([_, amount]) => amount > 0
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-500" />
            <span>{t('pnl')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            मासिक नफा-तोटा विश्लेषण • उत्पन्न विरुद्ध सर्व खर्च
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={onExportBillingCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Billing CSV</span>
          </button>

          <button
            onClick={onExportExpensesCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Expense CSV</span>
          </button>
        </div>
      </div>

      {/* Main KPI Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Profit (Primary Core USP) */}
        <div
          className={`rounded-3xl p-6 border shadow-2xl relative overflow-hidden flex flex-col justify-between ${
            isProfitable
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-slate-900 via-red-950/40 to-slate-900 border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('netProfit')} ({selectedMonth})
            </span>
            {isProfitable ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="my-4">
            <div
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isProfitable ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isProfitable ? '+' : ''}₹{pnlData.netProfit.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400">
              {isProfitable ? 'उत्पन्न वजा एकूण खर्च = निव्वळ नफा' : 'खर्च उत्पन्नापेक्षा जास्त आहे'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>जमा फी: ₹{pnlData.totalDuesCollected.toLocaleString('en-IN')}</span>
            <span>खर्च: ₹{pnlData.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('grossIncome')}</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-white">
              ₹{pnlData.totalDuesCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400">सभासदांकडून प्रत्यक्षात मिळालेली फी</span>
          </div>

          <div className="text-[11px] text-amber-400 border-t border-slate-800 pt-3">
            येणे बाकी (Unpaid Dues): ₹{pnlData.totalPendingDues.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('totalExpenses')}</span>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-red-400">
              ₹{pnlData.totalExpenses.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400">नियमित + दैनंदिन सर्व खर्च</span>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>नियमित: ₹{pnlData.totalRecurringExpenses.toLocaleString('en-IN')}</span>
            <span>दैनंदिन: ₹{pnlData.totalOneOffExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Comparative Analytics & Charts */}
      <PnLCharts pnlData={pnlData} />

      {/* Expense Distribution by Category Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
          {t('expenseBreakdown')}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {expenseBreakdown.map(([category, amount]) => (
            <div
              key={category}
              className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60"
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {category}
              </span>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
                ₹{amount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400">
                {Math.round((amount / (pnlData.totalExpenses || 1)) * 100)}% of total
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
