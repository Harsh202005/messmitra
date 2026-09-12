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
  DollarSign,
  Download,
  X,
  ChefHat,
  Flame,
  Home,
  UtensilsCrossed,
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
        return <Home className="w-4 h-4 text-blue-400" />;
      case 'salary':
        return <ChefHat className="w-4 h-4 text-amber-400" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'vegetables':
      case 'groceries':
      case 'dairy':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span>{t('expenses')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            नियमित मासिक खर्च • दैनंदिन भाजीपाला/किराणा • कर्मचारी मानधन
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'recurring' && (
            <button
              onClick={() => setIsAddRecurringOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नियमित खर्च जोडा</span>
            </button>
          )}

          {activeTab === 'oneoff' && (
            <button
              onClick={() => setIsAddOneOffOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addExpense')}</span>
            </button>
          )}

          {activeTab === 'staff' && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addStaff')}</span>
            </button>
          )}

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition ${
            activeTab === 'recurring'
              ? 'bg-slate-800 text-brand-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>{t('recurringExpenses')} (₹{totalRecurringAmount.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setActiveTab('oneoff')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition ${
            activeTab === 'oneoff'
              ? 'bg-slate-800 text-brand-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('oneOffExpenses')} (₹{totalOneOffAmount.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition ${
            activeTab === 'staff'
              ? 'bg-slate-800 text-brand-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>कर्मचारी सूची ({staffList.length})</span>
        </button>
      </div>

      {/* TAB 1: Recurring Expenses */}
      {activeTab === 'recurring' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddRecurringOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नियमित खर्च जोडा (Add Recurring)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recurringExpenses.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {getCategoryIcon(rec.category)}
                      {rec.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-white">{rec.payeeName}</h4>
                  <div className="text-2xl font-black text-amber-400 mt-2">
                    ₹{rec.amount.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal"> / दरमहा</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">देय: {rec.nextDueDate}</span>
                  <button
                    onClick={() => onConfirmRecurring(rec.id, '2026-09')}
                    className="flex items-center gap-1 px-3 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg font-bold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>निश्चित करा</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: One-Off Daily Expenses */}
      {activeTab === 'oneoff' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-fadeIn">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {oneOffExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {getCategoryIcon(exp.category)}
                      {exp.category}
                    </span>
                    <span className="text-xs text-slate-400">• {exp.date}</span>
                  </div>
                  {exp.note && <p className="text-xs text-slate-300 italic">{exp.note}</p>}
                  <span className="text-[10px] text-slate-500">नोंद: {exp.createdBy}</span>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-base font-black text-red-400">
                    -₹{exp.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Lightweight Staff */}
      {activeTab === 'staff' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addStaff')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.map((st) => (
              <div
                key={st.id}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-sm text-white">{st.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{st.role}</p>
                  {st.phone && <p className="text-[11px] text-slate-500 font-mono">{st.phone}</p>}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">मासिक मानधन</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ₹{st.monthlySalary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add One-Off Expense Modal */}
      {isAddOneOffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-400" />
                <span>{t('addExpense')}</span>
              </h3>
              <button
                onClick={() => setIsAddOneOffOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOneOffSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  वर्ग (Category) *
                </label>
                <select
                  value={oneOffForm.category}
                  onChange={(e) =>
                    setOneOffForm({ ...oneOffForm, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="vegetables">भाजीपाला (Vegetables)</option>
                  <option value="groceries">किराणा सामान (Groceries)</option>
                  <option value="dairy">दूध व डेअरी (Dairy)</option>
                  <option value="gas">गॅस (Gas)</option>
                  <option value="maintenance">दुरुस्ती व मेंटेनन्स (Maintenance)</option>
                  <option value="other">इतर (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  रक्कम (Amount in INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={oneOffForm.amount}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  तारीख (Date) *
                </label>
                <input
                  type="date"
                  required
                  value={oneOffForm.date}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  तपशील / पावती टिपण (Note)
                </label>
                <input
                  type="text"
                  placeholder="उदा. भाजी मंडी खरेदी"
                  value={oneOffForm.note}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOneOffOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 rounded-xl shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span>{t('addStaff')}</span>
              </h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="p-6 space-y-4 text-xs">
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मासिक मानधन (Monthly Salary in INR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={staffForm.monthlySalary}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, monthlySalary: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-600 rounded-xl shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recurring Expense Modal */}
      {isAddRecurringOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-400" />
                <span>नियमित खर्च जोडा (Add Recurring Expense)</span>
              </h3>
              <button
                onClick={() => setIsAddRecurringOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecurringSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खर्चाचा प्रकार (Category) *
                </label>
                <select
                  value={recurringForm.category}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  खर्च शीर्षक / मालकाचे नाव (Payee / Description) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. गाळा मालक भाडे, एचपी गॅस एजन्सी"
                  value={recurringForm.payeeName}
                  onChange={(e) => setRecurringForm({ ...recurringForm, payeeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मासिक रक्कम (Monthly Amount in INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={100}
                  value={recurringForm.amount}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पुढील देय तारीख (Next Due Date) *
                </label>
                <input
                  type="date"
                  required
                  value={recurringForm.nextDueDate}
                  onChange={(e) => setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecurringOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-600 rounded-xl shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
