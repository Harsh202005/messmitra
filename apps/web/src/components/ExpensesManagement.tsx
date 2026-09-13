'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import {
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
  ExpenseCategory,
} from '@messmitra/types';
import {
  TrendingDown,
  Repeat,
  ShoppingBag,
  Users,
  PlusCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Download,
  X,
  ChefHat,
  Flame,
  Home,
  UtensilsCrossed,
  Phone,
  Check,
} from 'lucide-react';

interface ExpensesManagementProps {
  recurringExpenses: ExpenseRecurring[];
  oneOffExpenses: ExpenseOneOff[];
  staffList: Staff[];
  onAddRecurring: (data: any) => Promise<void>;
  onConfirmRecurring: (id: string, month: string) => Promise<void>;
  onAddOneOff: (data: any) => Promise<void>;
  onAddStaff: (data: any) => Promise<void>;
  onExportCsv: () => void;
}

export const ExpensesManagement: React.FC<ExpensesManagementProps> = ({
  recurringExpenses,
  oneOffExpenses,
  staffList,
  onAddRecurring,
  onConfirmRecurring,
  onAddOneOff,
  onAddStaff,
  onExportCsv,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'recurring' | 'oneoff' | 'staff'>('recurring');

  // Modals
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [isAddOneOffOpen, setIsAddOneOffOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Forms
  const [recurringForm, setRecurringForm] = useState({
    category: 'rent' as ExpenseCategory,
    payeeName: '',
    amount: 15000,
    frequency: 'monthly' as const,
    nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [oneOffForm, setOneOffForm] = useState({
    category: 'vegetables' as ExpenseCategory,
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Head Cook (महाराज)',
    monthlySalary: 18000,
    phone: '',
  });

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddRecurring(recurringForm);
    setIsAddRecurringOpen(false);
    setRecurringForm({
      category: 'rent',
      payeeName: '',
      amount: 15000,
      frequency: 'monthly',
      nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
  };

  const handleOneOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddOneOff(oneOffForm);
    setIsAddOneOffOpen(false);
    setOneOffForm({
      category: 'vegetables',
      amount: 500,
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddStaff(staffForm);
    setIsAddStaffOpen(false);
    setStaffForm({
      name: '',
      role: 'Head Cook (महाराज)',
      monthlySalary: 18000,
      phone: '',
    });
  };

  const totalRecurringAmount = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((a, b) => a + b.amount, 0);

  const totalOneOffAmount = oneOffExpenses.reduce((a, b) => a + b.amount, 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'rent':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'salary':
        return <ChefHat className="w-4 h-4 text-amber-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'vegetables':
      case 'groceries':
      case 'dairy':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-500" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span>खर्च व्यवस्थापन (Expenses Management)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            नियमित मासिक खर्च • दैनंदिन भाजीपाला/किराणा • कर्मचारी मानधन
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === 'recurring') setIsAddRecurringOpen(true);
              else if (activeTab === 'oneoff') setIsAddOneOffOpen(true);
              else setIsAddStaffOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {activeTab === 'recurring'
                ? '+ नियमित खर्च जोडा'
                : activeTab === 'oneoff'
                ? '+ दैनंदिन खर्च जोडा'
                : '+ कर्मचारी जोडा'}
            </span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title={t('exportCsv')}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            नियमित मासिक खर्च
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalRecurringAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">गाळा भाडे, गॅस, वीज बिल</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            दैनंदिन खरेदी खर्च
          </span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalOneOffAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">भाजीपाला, किराणा, दूध</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            कर्मचारी मानधन
          </span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{staffList.filter((s) => s.isActive).reduce((a, b) => a + b.monthlySalary, 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">महाराज व मदतनीस पगार</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'recurring'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>नियमित मासिक खर्च ({recurringExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('oneoff')}
          className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'oneoff'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>दैनंदिन भाजीपाला/किराणा ({oneOffExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>कर्मचारी यादी ({staffList.length})</span>
        </button>
      </div>

      {/* Tab 1: Recurring Expenses (Mobile Stacked Cards) */}
      {activeTab === 'recurring' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              नियमित देयके (गाळा भाडे, कमर्शियल गॅस, इत्यादी)
            </h4>
            <span className="text-xs text-slate-400">दरमहा देय</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {expense.payeeName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{expense.category}</span>
                      <span>•</span>
                      <span>पुढील देय: {expense.nextDueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400">दरमहा (Monthly)</span>
                  </div>

                  <button
                    onClick={() => onConfirmRecurring(expense.id, new Date().toISOString().slice(0, 7))}
                    className="min-h-[40px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ह्या महिन्याचा खर्च निश्चित करा</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: One-Off Expenses */}
      {activeTab === 'oneoff' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              दैनंदिन नोंदी (भाजी मंडी, किराणा, ताजे दूध, इत्यादी)
            </h4>
            <span className="text-xs text-slate-400">एकूण {oneOffExpenses.length} नोंदी</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {oneOffExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                कोणतीही दैनंदिन खर्चाची नोंद नाही.
              </div>
            ) : (
              oneOffExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {expense.note || expense.category}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {expense.date} • {expense.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono font-black text-sm sm:text-base text-red-600 dark:text-red-400">
                    -₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Staff List */}
      {activeTab === 'staff' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              मेस आचारी व मदतनीस कर्मचारी ({staffList.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-600 shrink-0">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{staff.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                        {staff.role}
                      </span>
                    </div>
                    {staff.phone && (
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{staff.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    ₹{staff.monthlySalary.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ महिना मानधन</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Recurring Expense Modal (Bottom Sheet on Mobile) */}
      {isAddRecurringOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-500" />
                <span>नियमित मासिक खर्च जोडा</span>
              </h3>
              <button
                onClick={() => setIsAddRecurringOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecurringSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खर्चाचा प्रकार *
                </label>
                <select
                  value={recurringForm.category}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="rent">मेस गाळा भाडे (Rent)</option>
                  <option value="gas">कमर्शियल गॅस सिलिंडर (Gas)</option>
                  <option value="salary">कर्मचारी मानधन (Salary)</option>
                  <option value="maintenance">लाईट बिल / पाणी (Electricity/Water)</option>
                  <option value="other">इतर नियमित खर्च (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खर्च तपशील / मालकाचे नाव *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. गाळा भाडे, HP गॅस एजन्सी"
                  value={recurringForm.payeeName}
                  onChange={(e) => setRecurringForm({ ...recurringForm, payeeName: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मासिक रक्कम (Amount in ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  step={100}
                  value={recurringForm.amount}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पुढील देय तारीख *
                </label>
                <input
                  type="date"
                  required
                  value={recurringForm.nextDueDate}
                  onChange={(e) => setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer"
                >
                  नियमित खर्च सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add One-Off Modal (Bottom Sheet on Mobile) */}
      {isAddOneOffOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-500" />
                <span>दैनंदिन खर्च नोंद (Daily Expense)</span>
              </h3>
              <button
                onClick={() => setIsAddOneOffOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOneOffSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खर्च प्रकार *
                </label>
                <select
                  value={oneOffForm.category}
                  onChange={(e) =>
                    setOneOffForm({ ...oneOffForm, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="vegetables">ताजी भाजी मंडी (Vegetables)</option>
                  <option value="groceries">किराणा माल व तेल (Groceries)</option>
                  <option value="dairy">दूध, ताक व दही (Dairy)</option>
                  <option value="other">इतर किरकोळ खर्च (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खर्चाची रक्कम (Amount in ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  value={oneOffForm.amount}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  तारीख *
                </label>
                <input
                  type="date"
                  required
                  value={oneOffForm.date}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  तपशील / टिपण (Note)
                </label>
                <input
                  type="text"
                  placeholder="उदा. भाजी मंडी खरेदी"
                  value={oneOffForm.note}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, note: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer"
                >
                  खर्च नोंद सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal (Bottom Sheet on Mobile) */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span>नवीन कर्मचारी जोडा (Add Staff)</span>
              </h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कर्मचाऱ्याचे नाव *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. महादेव मामा"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पद / काम (Role) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Head Cook (महाराज)"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मासिक मानधन (Salary in ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={0}
                  step={500}
                  value={staffForm.monthlySalary}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, monthlySalary: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मोबाइल नंबर (Phone)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="उदा. 9822338975"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer"
                >
                  कर्मचारी सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
