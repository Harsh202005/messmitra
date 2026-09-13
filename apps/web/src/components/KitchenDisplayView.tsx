'use client';

import React, { useState } from 'react';
import { DailyCookForecast, LeaveRequest, Member, isNonVegDay, getWeeklyDayScheduleMarathi } from '@messmitra/types';
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
  onDateChange: (date: string) => void;
  cutoffTime?: string;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  forecast,
  leaves,
  members,
  onDateChange,
  cutoffTime = '18:00',
}) => {
  const { t } = useI18n();

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
      {/* Top Banner for Kitchen Staff */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-850 to-emerald-900 p-5 sm:p-7 border border-emerald-500/30 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/40 shrink-0">
              <ChefHat className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>श्री बालाजी मेस • २१ वर्षांची परंपरा</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  isNonVegToday
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                    : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                }`}>
                  {scheduleInfo.badgeText}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                दैनिक स्वयंपाक अंदाज (Cooking Headcount)
              </h1>
              <p className="text-xs text-slate-200 mt-0.5">
                वार: <strong className="text-yellow-300">{scheduleInfo.dayName}</strong> • दुपार कटऑफ: <strong>09:00 AM</strong> • रात्र कटऑफ: <strong>06:00 PM</strong>
              </p>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2 flex-wrap bg-emerald-950/70 p-2 rounded-2xl border border-emerald-500/30">
            <button
              onClick={() => onDateChange(todayStr)}
              className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isToday
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-900/60 text-emerald-100 hover:text-white'
              }`}
            >
              आज (Today)
            </button>
            <button
              onClick={() => onDateChange(tomorrowStr)}
              className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isTomorrow
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-900/60 text-emerald-100 hover:text-white'
              }`}
            >
              उद्या (Tomorrow)
            </button>
            <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1.5 min-h-[38px] rounded-xl border border-emerald-500/40 text-xs">
              <CalendarDays className="w-4 h-4 text-emerald-300" />
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
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100/70 dark:from-emerald-950 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-4 border border-emerald-300 dark:border-emerald-500/60 shadow-sm flex flex-col justify-between">
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

        {/* 🟢 Veg Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 border border-emerald-300 dark:border-emerald-500/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🟢 शाकाहारी</span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
              {isNonVegToday ? 'व्हेज' : 'सर्व'}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight font-mono">
              {actualVegHeads}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
              {isNonVegToday ? 'शाकाहारी ताटे' : '१००% शाकाहारी भोजन'}
            </span>
          </div>
        </div>

        {/* 🔴 Non-Veg Count */}
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 border shadow-sm flex flex-col justify-between ${
            isNonVegToday
              ? 'bg-white dark:bg-slate-900/90 border-rose-300 dark:border-rose-500/40'
              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🔴 मांसाहारी/अंडी</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950">
              {isNonVegToday ? '३ दिवस' : 'आज नाही'}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-300 tracking-tight font-mono">
              {actualNonVegHeads}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
              {isNonVegToday ? 'मांसाहारी ताटे (बुध/शुक्र/रवि)' : 'आज पूर्ण शाकाहारी'}
            </span>
          </div>
        </div>

        {/* Lunch Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 border border-amber-300 dark:border-amber-500/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">दुपार (Lunch)</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider">रात्र (Dinner)</span>
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
              <span>अंदाजे जिन्नस प्रमाण (Material Quantities)</span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isNonVegToday ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
            }`}>
              {isNonVegToday ? '🍗 मांसाहारी मेनू दिवस' : '🥗 १००% शाकाहारी मेनू'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
                <Soup className="w-4 h-4" />
                <span>तांदूळ (Raw Rice)</span>
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
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-300 dark:border-rose-750">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-1">
                  <Egg className="w-4 h-4" />
                  <span>अंडी / चिकन प्रमाण</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-300 font-mono">
                  ~ {estimatedEggsCount} अंडी / {estimatedChickenKg}kg
                </div>
                <span className="text-[10px] text-rose-600 dark:text-rose-400">({actualNonVegHeads} मांसाहारी सभासद)</span>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                  <Flame className="w-4 h-4" />
                  <span>भाजीपाला (Vegetables)</span>
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
