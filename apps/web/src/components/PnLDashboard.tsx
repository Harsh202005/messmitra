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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-500" />
            <span>{t('pnl')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            मासिक नफा-तोटा विश्लेषण • उत्पन्न विरुद्ध सर्व खर्च
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={onExportBillingCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Billing CSV</span>
          </button>

          <button
            onClick={onExportExpensesCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition"
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
          className={`rounded-3xl p-6 border shadow-md relative overflow-hidden flex flex-col justify-between ${
            isProfitable
              ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-900 border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-white'
              : 'bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/60 dark:from-slate-900 dark:via-red-950/40 dark:to-slate-900 border-rose-300 dark:border-red-500/40 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('netProfit')} ({selectedMonth})
            </span>
            {isProfitable ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="my-4">
            <div
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isProfitable ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {isProfitable ? '+' : ''}₹{pnlData.netProfit.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {isProfitable ? 'उत्पन्न वजा एकूण खर्च = निव्वळ नफा' : 'खर्च उत्पन्नापेक्षा जास्त आहे'}
            </span>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
            <span>जमा फी: ₹{pnlData.totalDuesCollected.toLocaleString('en-IN')}</span>
            <span>खर्च: ₹{pnlData.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('grossIncome')}</span>
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              ₹{pnlData.totalDuesCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">सभासदांकडून प्रत्यक्षात मिळालेली फी</span>
          </div>

          <div className="text-[11px] text-amber-700 dark:text-amber-400 border-t border-slate-150 dark:border-slate-800 pt-3">
            येणे बाकी (Unpaid Dues): ₹{pnlData.totalPendingDues.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('totalExpenses')}</span>
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-red-600 dark:text-red-400">
              ₹{pnlData.totalExpenses.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">नियमित + दैनंदिन सर्व खर्च</span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-150 dark:border-slate-800 pt-3 flex items-center justify-between">
            <span>नियमित: ₹{pnlData.totalRecurringExpenses.toLocaleString('en-IN')}</span>
            <span>दैनंदिन: ₹{pnlData.totalOneOffExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Comparative Analytics & Charts */}
      <PnLCharts pnlData={pnlData} />

      {/* Expense Distribution by Category Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('expenseBreakdown')} (Category-wise Distribution)
          </h4>
          <span className="text-xs text-slate-400">एकूण खर्च: ₹{pnlData.totalExpenses.toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {expenseBreakdown.map(([category, amount]) => {
            const categoryLabelsMr: Record<string, string> = {
              groceries: 'किराणा व भाजीपाला',
              vegetables: 'ताजी भाजी मंडी',
              dairy: 'दूध, ताक व दही',
              gas: 'कमर्शियल गॅस / इंधन',
              rent: 'मेस गाळा भाडे',
              salary: 'कर्मचारी उचल व पगार',
              maintenance: 'किचन देखभाल व दुरुस्ती',
              utilities: 'लाईट बिल आणि पाणी',
              packaging: 'डबा पॅकिंग साहित्य',
              other: 'इतर किरकोळ खर्च',
            };
            const label = categoryLabelsMr[category] || category;
            const pct = Math.round((amount / (pnlData.totalExpenses || 1)) * 100);

            return (
              <div
                key={category}
                className="bg-[#fbf9f4] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-[#eae3d5] dark:border-slate-700/60 shadow-xs"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                  {label}
                </span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {pct}% of total
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
