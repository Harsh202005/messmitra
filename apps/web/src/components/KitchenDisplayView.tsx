'use client';

import React, { useState } from 'react';
import { DailyCookForecast, LeaveRequest, Member, Mess, isNonVegDay, getWeeklyDayScheduleMarathi, formatTime12Hour } from '@messmitra/types';
import { useI18n } from '../lib/i18n';
import {
  ChefHat,
  Sun,
  Moon,
  Users,
  UserX,
  CalendarDays,
  Sparkles,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Flame,
  Scale,
  Soup,
  Egg,
} from 'lucide-react';

interface KitchenDisplayViewProps {
  forecast: DailyCookForecast;
  leaves: LeaveRequest[];
  members: Member[];
  mess?: Mess | null;
  onDateChange: (date: string) => void;
  cutoffTime?: string;
  lunchCutoffTime?: string;
  dinnerCutoffTime?: string;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  forecast,
  leaves,
  members,
  mess,
  onDateChange,
  cutoffTime = '18:00',
  lunchCutoffTime,
  dinnerCutoffTime,
}) => {
  const { t, language } = useI18n();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const isToday = forecast.date === todayStr;
  const isTomorrow = forecast.date === tomorrowStr;

  const scheduleInfo = getWeeklyDayScheduleMarathi(forecast.date);
  const isNonVegToday = scheduleInfo.isNonVegDay;

  // Filter leaves active on the forecast date
  const leavesOnSelectedDate = leaves.filter(
    (l) =>
      (l.status === 'auto_valid' || l.status === 'approved') &&
      l.startDate <= forecast.date &&
      l.endDate >= forecast.date
  );

  // Material estimates based on head count
  const estimatedRiceKg = (forecast.cookForCount * 0.12).toFixed(1); // 120g uncooked rice per person
  const estimatedDalKg = (forecast.cookForCount * 0.045).toFixed(1); // 45g dal per person
  const estimatedChapatiCount = forecast.cookForCount * 4; // 4 chapatis per head
  const estimatedVegetablesKg = (forecast.cookForCount * 0.15).toFixed(1); // 150g sabzi per person

  const actualNonVegHeads = isNonVegToday ? (forecast.nonVegCount ?? 0) : 0;
  const actualVegHeads = isNonVegToday ? (forecast.vegCount ?? forecast.cookForCount) : forecast.cookForCount;

  // Non-veg material estimate (on Wed/Fri/Sun)
  const estimatedEggsCount = actualNonVegHeads * 2;
  const estimatedChickenKg = (actualNonVegHeads * 0.2).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Top Banner for Kitchen Staff (Dynamic: Rich Crimson on Non-Veg Days, Emerald on Pure Veg Days) */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border shadow-xl text-white transition-all duration-300 ${
          isNonVegToday
            ? 'bg-gradient-to-r from-red-900 via-rose-900 to-amber-950 border-red-500/40 shadow-red-950/30'
            : 'bg-gradient-to-r from-emerald-850 via-teal-900 to-emerald-950 border-emerald-500/30 shadow-emerald-950/30'
        }`}
      >
        <div
          className={`absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isNonVegToday ? 'bg-red-500/20' : 'bg-emerald-500/15'
          }`}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center text-white shadow-xl border shrink-0 ${
                isNonVegToday
                  ? 'bg-gradient-to-br from-red-500 to-rose-700 shadow-red-600/40 border-red-400/50'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-600/30 border-emerald-400/40'
              }`}
            >
              <ChefHat className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div
                className={`flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider mb-1 ${
                  isNonVegToday ? 'text-rose-200' : 'text-emerald-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>श्री बालाजी मेस • २१ वर्षांची परंपरा</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    isNonVegToday
                      ? 'bg-rose-500/50 text-white border-rose-300 shadow-sm'
                      : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                  }`}
                >
                  {scheduleInfo.badgeText}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {language === 'en' ? 'Daily Cooking Headcount' : 'दैनिक स्वयंपाक अंदाज'}
              </h1>
              <p className="text-xs text-slate-200 mt-0.5">
                वार: <strong className="text-yellow-300">{scheduleInfo.dayName}</strong> • दुपार कटऑफ: <strong>{formatTime12Hour(lunchCutoffTime || mess?.lunchCutoffTime || '09:00')}</strong> • रात्र कटऑफ: <strong>{formatTime12Hour(dinnerCutoffTime || mess?.dinnerCutoffTime || mess?.dailyCutoffTime || cutoffTime || '18:00')}</strong>
              </p>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto p-1.5 sm:p-2 rounded-2xl border ${
              isNonVegToday
                ? 'bg-red-950/80 border-red-500/40'
                : 'bg-emerald-950/70 border-emerald-500/30'
            }`}
          >
            <button
              onClick={() => onDateChange(todayStr)}
              className={`flex-1 sm:flex-none justify-center px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isToday
                  ? isNonVegToday
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-500 text-white shadow-md'
                  : isNonVegToday
                  ? 'bg-red-900/60 text-red-100 hover:text-white'
                  : 'bg-emerald-900/60 text-emerald-100 hover:text-white'
              }`}
            >
              {language === 'en' ? 'Today' : 'आज'}
            </button>
            <button
              onClick={() => onDateChange(tomorrowStr)}
              className={`flex-1 sm:flex-none justify-center px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isTomorrow
                  ? isNonVegToday
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-500 text-white shadow-md'
                  : isNonVegToday
                  ? 'bg-red-900/60 text-red-100 hover:text-white'
                  : 'bg-emerald-900/60 text-emerald-100 hover:text-white'
              }`}
            >
              {language === 'en' ? 'Tomorrow' : 'उद्या'}
            </button>
            {/* Custom Date Picker - Hidden on Mobile */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs ${
                isNonVegToday
                  ? 'bg-red-900/80 border-red-500/40'
                  : 'bg-emerald-900/80 border-emerald-500/40'
              }`}
            >
              <CalendarDays className={`w-4 h-4 ${isNonVegToday ? 'text-red-300' : 'text-emerald-300'}`} />
              <input
                type="date"
                value={forecast.date}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Big Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Total Net Heads Cook For */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/70 dark:from-emerald-950 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-4 border-2 border-emerald-400 dark:border-emerald-500/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">एकूण स्वयंपाक</span>
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300">
              <ChefHat className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
              {forecast.cookForCount}
            </div>
            <span className="text-[10px] text-emerald-800/80 dark:text-emerald-200/80 mt-0.5 block font-medium">निव्वळ ताटे</span>
          </div>
        </div>

        {/* 🟢 Veg Count - Pure Green styling */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/60 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-4 border-2 border-emerald-400 dark:border-emerald-500/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🟢 शाकाहारी</span>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-200/70 dark:bg-emerald-900/80 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-700">
              {isNonVegToday ? 'व्हेज' : 'सर्व'}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight font-mono">
              {actualVegHeads}
            </div>
            <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 block font-medium">
              {isNonVegToday ? 'शाकाहारी ताटे' : '१००% शाकाहारी भोजन'}
            </span>
          </div>
        </div>

        {/* 🔴 Non-Veg Count - Distinct Warm Crimson / Ruby Red styling */}
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 border-2 shadow-md flex flex-col justify-between transition-all ${
            isNonVegToday
              ? 'bg-gradient-to-br from-rose-100 via-red-50 to-orange-50 dark:from-rose-950 dark:via-red-950 dark:to-slate-900 border-red-500 dark:border-red-500 ring-2 ring-red-400/20'
              : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <span>🍗 मांसाहारी/अंडी</span>
            </span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded shadow-sm ${
                isNonVegToday
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {isNonVegToday ? '३ दिवस' : 'आज नाही'}
            </span>
          </div>
          <div>
            <div
              className={`text-3xl font-black tracking-tight font-mono ${
                isNonVegToday ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {actualNonVegHeads}
            </div>
            <span
              className={`text-[10px] mt-0.5 block font-bold ${
                isNonVegToday ? 'text-red-700 dark:text-red-300' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isNonVegToday ? 'मांसाहारी ताटे (फक्त रात्री)' : 'आज पूर्ण शाकाहारी'}
            </span>
          </div>
        </div>

        {/* Lunch Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 border border-amber-300 dark:border-amber-500/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'en' ? 'Lunch' : 'दुपार'}</span>
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-300 tracking-tight font-mono">
              {forecast.lunchCount}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">दुपारची ताटे</span>
          </div>
        </div>

        {/* Dinner Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 border border-indigo-300 dark:border-indigo-500/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'en' ? 'Dinner' : 'रात्र'}</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-300 tracking-tight font-mono">
              {forecast.dinnerCount}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">रात्रीची ताटे</span>
          </div>
        </div>

        {/* Members on Leave */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 border border-rose-300 dark:border-rose-500/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">सुट्टीवर</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
              {forecast.membersOnLeave}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">आज गैरहजर</span>
          </div>
        </div>
      </div>

      {/* Material Estimation Guide + Leave Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Material Estimation Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'Estimated Material Quantities' : 'अंदाजे जिन्नस प्रमाण'}</span>
            </div>
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 ${
              isNonVegToday ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
            }`}>
              {isNonVegToday 
                ? (language === 'en' ? '🍗 Non-Veg Special Day' : '🍗 मांसाहारी मेनू दिवस')
                : (language === 'en' ? '🥗 100% Pure Veg Menu' : '🥗 १००% शाकाहारी मेनू')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
                <Soup className="w-4 h-4" />
                <span>{language === 'en' ? 'Raw Rice' : 'तांदूळ'}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                ~ {estimatedRiceKg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-400">१२० ग्रॅम / व्यक्ती</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
              <div className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400 text-xs font-semibold mb-1">
                <Soup className="w-4 h-4" />
                <span>तूर / मूग डाळ</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                ~ {estimatedDalKg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-400">४५ ग्रॅम / व्यक्ती</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
              <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-1">
                <UtensilsCrossed className="w-4 h-4" />
                <span>चपाती / पोळी संख्या</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                ~ {estimatedChapatiCount} <span className="text-xs font-normal text-slate-400">नग</span>
              </div>
              <span className="text-[10px] text-slate-400">४ चपात्या / व्यक्ती</span>
            </div>

            {isNonVegToday ? (
              <div className="bg-gradient-to-br from-rose-100 via-orange-50 to-red-100 dark:from-rose-950 dark:via-red-950/80 dark:to-slate-900 p-3.5 rounded-2xl border-2 border-red-400 dark:border-red-500 shadow-md">
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-bold mb-1">
                  <Egg className="w-4 h-4 text-red-600" />
                  <span>अंडी / चिकन प्रमाण</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-red-700 dark:text-red-300 font-mono">
                  ~ {estimatedEggsCount} अंडी / {estimatedChickenKg}kg
                </div>
                <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-200/80 dark:bg-red-900/60 px-1.5 py-0.5 rounded inline-block mt-0.5">
                  🍗 ({actualNonVegHeads} मांसाहारी सभासद)
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                  <Flame className="w-4 h-4" />
                  <span>{language === 'en' ? 'Vegetables' : 'भाजीपाला'}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ~ {estimatedVegetablesKg} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <span className="text-[10px] text-slate-400">१५० ग्रॅम / व्यक्ती</span>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>अन्नाची नासाडी टाळण्यासाठी ही गणना अचूक ठेवली आहे.</span>
          </div>
        </div>

        {/* Members on Leave Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>आज गैरहजर सभासद ({leavesOnSelectedDate.length})</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">तारीख: {forecast.date}</span>
          </div>

          {leavesOnSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
              <p className="font-bold text-slate-800 dark:text-slate-200">आज कोणीही सुट्टीवर नाही!</p>
              <p>सर्व नोंदणीकृत सभासद हजर आहेत.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto space-y-1">
              {leavesOnSelectedDate.map((leave) => (
                <div key={leave.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{leave.memberName || 'सभासद'}</h4>
                    <p className="text-slate-500 text-[11px]">
                      कालावधी: {leave.startDate} ते {leave.endDate}
                    </p>
                    {leave.reason && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                        कारण: &quot;{leave.reason}&quot;
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300">
                    जेवण नाही
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
