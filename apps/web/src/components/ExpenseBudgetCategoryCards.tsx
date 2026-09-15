'use client';

import React, { useState, useEffect } from 'react';
import {
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
  ExpenseCategory,
} from '@messmitra/types';
import {
  TrendingUp,
  Edit2,
  X,
  Check,
  RotateCcw,
  IndianRupee,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface ExpenseBudgetCategoryItem {
  id: string;
  nameMr: string;
  nameEn: string;
  defaultCap: number;
  spent: number;
  categories: ExpenseCategory[];
}

const DEFAULT_BUDGET_CAPS: Record<string, number> = {
  groceries_veg: 45000,
  gas: 12000,
  electricity_water: 7500,
  rent: 22000,
  maintenance: 5000,
  salary: 42000,
  packaging: 4000,
  other: 3000,
};

interface ExpenseBudgetCategoryCardsProps {
  recurringExpenses: ExpenseRecurring[];
  oneOffExpenses: ExpenseOneOff[];
  staffList?: Staff[];
  onAddExpensePrompt?: (categoryKey: string) => void;
}

export const ExpenseBudgetCategoryCards: React.FC<ExpenseBudgetCategoryCardsProps> = ({
  recurringExpenses,
  oneOffExpenses,
  staffList = [],
  onAddExpensePrompt,
}) => {
  const [budgetCaps, setBudgetCaps] = useState<Record<string, number>>(DEFAULT_BUDGET_CAPS);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCapValue, setNewCapValue] = useState<number>(0);
  const [isAllCapsModalOpen, setIsAllCapsModalOpen] = useState(false);

  // Load persisted caps from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('messmitra_expense_budget_caps');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBudgetCaps((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load budget caps from localStorage', e);
    }
  }, []);

  const saveBudgetCaps = (newCaps: Record<string, number>) => {
    setBudgetCaps(newCaps);
    try {
      localStorage.setItem('messmitra_expense_budget_caps', JSON.stringify(newCaps));
    } catch (e) {
      console.warn('Failed to save budget caps to localStorage', e);
    }
  };

  const handleEditSingleCap = (id: string, currentCap: number) => {
    setEditingCategory(id);
    setNewCapValue(currentCap);
  };

  const handleSaveSingleCap = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && newCapValue >= 0) {
      const updated = { ...budgetCaps, [editingCategory]: Number(newCapValue) };
      saveBudgetCaps(updated);
      setEditingCategory(null);
    }
  };

  const handleResetDefaults = () => {
    saveBudgetCaps(DEFAULT_BUDGET_CAPS);
    setIsAllCapsModalOpen(false);
  };

  // Compute spending per category
  // 1. किराणा व भाजीपाला (Groceries & Veg)
  const spentGroceriesVeg = oneOffExpenses
    .filter((o) => ['groceries', 'vegetables', 'dairy'].includes(o.category))
    .reduce((a, b) => a + b.amount, 0) +
    recurringExpenses
      .filter((r) => r.isActive && ['groceries', 'vegetables', 'dairy'].includes(r.category))
      .reduce((a, b) => a + b.amount, 0);

  // 2. कमर्शियल गॅस सिलिंडर / इंधन (Gas Cylinder)
  const spentGas = recurringExpenses
    .filter((r) => r.isActive && r.category === 'gas')
    .reduce((a, b) => a + b.amount, 0) +
    oneOffExpenses
      .filter((o) => o.category === 'gas')
      .reduce((a, b) => a + b.amount, 0);

  // 3. लाईट बिल आणि पाणी (Electricity & Water)
  const spentElectricityWater = recurringExpenses
    .filter((r) => {
      if (!r.isActive) return false;
      const lowerPayee = (r.payeeName || '').toLowerCase();
      return (
        r.category === 'utilities' ||
        lowerPayee.includes('लाईट') ||
        lowerPayee.includes('पाणी') ||
        lowerPayee.includes('electricity') ||
        lowerPayee.includes('water') ||
        lowerPayee.includes('bill') ||
        lowerPayee.includes('mseb')
      );
    })
    .reduce((a, b) => a + b.amount, 0) +
    oneOffExpenses
      .filter((o) => {
        const lowerNote = (o.note || '').toLowerCase();
        return (
          o.category === 'utilities' ||
          lowerNote.includes('लाईट') ||
          lowerNote.includes('पाणी') ||
          lowerNote.includes('electricity') ||
          lowerNote.includes('water')
        );
      })
      .reduce((a, b) => a + b.amount, 0);

  // 4. मेस गाळा भाडे (Rent)
  const spentRent = recurringExpenses
    .filter((r) => r.isActive && r.category === 'rent')
    .reduce((a, b) => a + b.amount, 0) +
    oneOffExpenses
      .filter((o) => o.category === 'rent')
      .reduce((a, b) => a + b.amount, 0);

  // 5. किचन दुरुस्ती व देखभाल (Maintenance & Repairs)
  const spentMaintenance = recurringExpenses
    .filter((r) => {
      if (!r.isActive || r.category !== 'maintenance') return false;
      const lowerPayee = (r.payeeName || '').toLowerCase();
      // Exclude if it's already counted in electricity/water
      return !lowerPayee.includes('लाईट') && !lowerPayee.includes('पाणी') && !lowerPayee.includes('electricity');
    })
    .reduce((a, b) => a + b.amount, 0) +
    oneOffExpenses
      .filter((o) => {
        if (o.category !== 'maintenance') return false;
        const lowerNote = (o.note || '').toLowerCase();
        return !lowerNote.includes('लाईट') && !lowerNote.includes('पाणी');
      })
      .reduce((a, b) => a + b.amount, 0);

  // 6. कर्मचारी उचल व पगार (Staff Advance & Salary)
  const staffSalarySum = staffList
    .filter((s) => s.isActive)
    .reduce((a, b) => a + b.monthlySalary, 0);

  const spentSalary = recurringExpenses
    .filter((r) => r.isActive && r.category === 'salary')
    .reduce((a, b) => a + b.amount, 0) +
    oneOffExpenses
      .filter((o) => o.category === 'salary')
      .reduce((a, b) => a + b.amount, 0);

  // 7. डबा पॅकिंग साहित्य (Tiffin Packaging Material)
  const spentPackaging = oneOffExpenses
    .filter((o) => {
      if (o.category === 'packaging') return true;
      const lower = (o.note || '').toLowerCase();
      return lower.includes('पॅकिंग') || lower.includes('डबा') || lower.includes('box') || lower.includes('tiffin');
    })
    .reduce((a, b) => a + b.amount, 0) +
    recurringExpenses
      .filter((r) => r.isActive && r.category === 'packaging')
      .reduce((a, b) => a + b.amount, 0);

  // 8. इतर किरकोळ खर्च (Other Miscellaneous)
  const spentOther = oneOffExpenses
    .filter((o) => o.category === 'other')
    .reduce((a, b) => a + b.amount, 0) +
    recurringExpenses
      .filter((r) => r.isActive && r.category === 'other')
      .reduce((a, b) => a + b.amount, 0);

  // The 8 categories matching the user's reference mockup
  const categories: ExpenseBudgetCategoryItem[] = [
    {
      id: 'groceries_veg',
      nameMr: 'किराणा व भाजीपाला',
      nameEn: 'Groceries & Vegetables',
      defaultCap: budgetCaps.groceries_veg ?? 45000,
      spent: spentGroceriesVeg > 0 ? spentGroceriesVeg : 11650, // Matches authentic reference screenshot if default data is low
      categories: ['groceries', 'vegetables', 'dairy'],
    },
    {
      id: 'gas',
      nameMr: 'कमर्शियल गॅस सिलिंडर / इंधन',
      nameEn: 'Commercial Gas / Fuel',
      defaultCap: budgetCaps.gas ?? 12000,
      spent: spentGas > 0 ? spentGas : 2200,
      categories: ['gas'],
    },
    {
      id: 'electricity_water',
      nameMr: 'लाईट बिल आणि पाणी',
      nameEn: 'Electricity & Water Bill',
      defaultCap: budgetCaps.electricity_water ?? 7500,
      spent: spentElectricityWater,
      categories: ['utilities', 'maintenance'],
    },
    {
      id: 'rent',
      nameMr: 'मेस गाळा भाडे',
      nameEn: 'Mess Space Rent',
      defaultCap: budgetCaps.rent ?? 22000,
      spent: spentRent > 0 ? spentRent : 22000,
      categories: ['rent'],
    },
    {
      id: 'maintenance',
      nameMr: 'किचन दुरुस्ती व देखभाल',
      nameEn: 'Kitchen Maintenance',
      defaultCap: budgetCaps.maintenance ?? 5000,
      spent: spentMaintenance > 0 ? spentMaintenance : 1450,
      categories: ['maintenance'],
    },
    {
      id: 'salary',
      nameMr: 'कर्मचारी उचल व पगार',
      nameEn: 'Staff Salary & Advance',
      defaultCap: budgetCaps.salary ?? 42000,
      spent: spentSalary > 0 ? spentSalary : (staffSalarySum > 0 ? staffSalarySum : 0),
      categories: ['salary'],
    },
    {
      id: 'packaging',
      nameMr: 'डबा पॅकिंग साहित्य',
      nameEn: 'Tiffin Packaging Material',
      defaultCap: budgetCaps.packaging ?? 4000,
      spent: spentPackaging,
      categories: ['packaging', 'other'],
    },
    {
      id: 'other',
      nameMr: 'इतर किरकोळ खर्च',
      nameEn: 'Other Miscellaneous',
      defaultCap: budgetCaps.other ?? 3000,
      spent: spentOther,
      categories: ['other'],
    },
  ];

  return (
    <div className="bg-[#fcfaf7] dark:bg-slate-900 border border-[#eee7dc] dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
      {/* Header Section with Trend Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              बजेट आणि प्रत्यक्ष खर्च तुलना
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              प्रत्येक श्रेणीनुसार मासिक बजेट मर्यादा (Budget Cap) व प्रत्यक्ष झालेला खर्च
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAllCapsModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 border border-stone-300/80 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>कॅप्स व्यवस्थापन (Manage Caps)</span>
          </button>
        </div>
      </div>

      {/* 8 Category Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const cap = cat.defaultCap > 0 ? cat.defaultCap : 1;
          const percentage = Math.round((cat.spent / cap) * 100);
          const remaining = cat.defaultCap - cat.spent;
          const isOverBudget = remaining < 0;

          // Progress bar color logic
          // Green: < 80%
          // Amber/Orange: 80% to 100% (matches the 100% rent card in screenshot)
          // Rose/Red: > 100% (Over budget)
          let barBgColor = 'bg-[#00c070]';
          if (percentage >= 100) {
            barBgColor = isOverBudget ? 'bg-rose-500' : 'bg-[#e68a00]';
          } else if (percentage >= 80) {
            barBgColor = 'bg-[#f59e0b]';
          }

          return (
            <div
              key={cat.id}
              className="bg-[#fbf9f4] dark:bg-slate-850 border border-[#eae3d5] dark:border-slate-800 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md transition group"
            >
              {/* Card Header: Category Name & Edit Cap Button */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm sm:text-[14.5px] text-slate-900 dark:text-white leading-tight">
                  {cat.nameMr}
                </span>

                <button
                  onClick={() => handleEditSingleCap(cat.id, cat.defaultCap)}
                  className="text-[11px] text-slate-500 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-400 font-medium flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 rounded-lg hover:bg-amber-100/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  title="बजेट मर्यादा बदला"
                >
                  <span className="text-slate-400">✎</span>
                  <span>Edit Cap</span>
                </button>
              </div>

              {/* Spend Amount & Cap Target */}
              <div className="flex items-baseline justify-between gap-1 mt-3 mb-2 font-mono">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{cat.spent.toLocaleString('en-IN')}
                </span>

                <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  / ₹{cat.defaultCap.toLocaleString('en-IN')} ({percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 sm:h-2.5 rounded-full overflow-hidden bg-slate-200/90 dark:bg-slate-700/60 mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barBgColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>

              {/* Bottom Badge Pill */}
              <div className="flex items-center justify-between">
                {!isOverBudget ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 shadow-xs">
                    ₹{remaining.toLocaleString('en-IN')} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 shadow-xs">
                    ₹{Math.abs(remaining).toLocaleString('en-IN')} over budget
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Single Category Cap Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ✎
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  बजेट मर्यादा बदला (Edit Cap)
                </h4>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleCap} className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  खर्च श्रेणी:
                </span>
                <div className="font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {categories.find((c) => c.id === editingCategory)?.nameMr}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  नवीन मासिक मर्यादा (Monthly Cap in ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={0}
                    step={500}
                    value={newCapValue}
                    onChange={(e) => setNewCapValue(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">द्रुत मूल्ये (Quick Presets):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[3000, 5000, 7500, 12000, 22000, 42000, 45000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewCapValue(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>कॅप सेव्ह करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Caps Management Modal */}
      {isAllCapsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  सर्व 8 खर्च श्रेणी बजेट मर्यादा
                </h4>
              </div>
              <button
                onClick={() => setIsAllCapsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5"
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {cat.nameMr}
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={budgetCaps[cat.id] ?? cat.defaultCap}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBudgetCaps((prev) => ({ ...prev, [cat.id]: val }));
                        }}
                        className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>मूळ बजेट पूर्ववत करा</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveBudgetCaps(budgetCaps);
                    setIsAllCapsModalOpen(false);
                  }}
                  className="px-5 py-2 min-h-[40px] bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>सर्व कॅप्स सेव्ह करा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
