'use client';

import React from 'react';
import { useI18n } from '../lib/i18n';
import { DailyCookForecast, isNonVegDay, getWeeklyDayScheduleMarathi, Mess, formatTime12Hour } from '@messmitra/types';
import { ChefHat, Users, UserX, Sun, Moon, CalendarDays, Sparkles, UtensilsCrossed } from 'lucide-react';

interface DailyForecastCardProps {
  forecast: DailyCookForecast;
  mess?: Mess | null;
  cutoffTime?: string;
  lunchCutoffTime?: string;
  dinnerCutoffTime?: string;
  onDateChange?: (date: string) => void;
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({
  forecast,
  mess,
  cutoffTime = '18:00',
  lunchCutoffTime,
  dinnerCutoffTime,
  onDateChange,
}) => {
  const { t, language } = useI18n();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const isToday = forecast.date === todayStr;
  const isTomorrow = forecast.date === tomorrowStr;

  const scheduleInfo = getWeeklyDayScheduleMarathi(forecast.date);
  const isNonVegToday = scheduleInfo.isNonVegDay;

  const effectiveLunchCutoff = lunchCutoffTime || mess?.lunchCutoffTime || '09:00';
  const effectiveDinnerCutoff = dinnerCutoffTime || mess?.dinnerCutoffTime || mess?.dailyCutoffTime || cutoffTime || '18:00';

  const formattedLunchCutoff = formatTime12Hour(effectiveLunchCutoff, '09:00 AM');
  const formattedDinnerCutoff = formatTime12Hour(effectiveDinnerCutoff, '06:00 PM');

  const [showGroceryEstimates, setShowGroceryEstimates] = React.useState(false);

  // Grocery estimates
  const estimatedRiceKg = (forecast.cookForCount * 0.12).toFixed(1);
  const estimatedDalKg = (forecast.cookForCount * 0.045).toFixed(1);
  const estimatedChapatiCount = forecast.cookForCount * 4;
  const estimatedVegetablesKg = (forecast.cookForCount * 0.15).toFixed(1);
  const actualNonVegHeads = isNonVegToday ? (forecast.nonVegCount ?? 0) : 0;
  const estimatedEggsCount = actualNonVegHeads * 2;
  const estimatedChickenKg = (actualNonVegHeads * 0.2).toFixed(1);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800">
      {/* Background glowing ambient light */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-150 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-500/30 shadow-sm shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {isTomorrow ? t('tomorrowForecast') : `जेवण अंदाज (${forecast.date})`}
              </h3>
              {/* Day of Week Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isNonVegToday
                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                }`}
              >
                {scheduleInfo.badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              वार: <strong className="text-slate-800 dark:text-slate-200">{scheduleInfo.dayName}</strong> • दुपार कटऑफ: <strong className="text-amber-700 dark:text-amber-300 font-bold">{formattedLunchCutoff}</strong> • रात्र कटऑफ: <strong className="text-amber-700 dark:text-amber-300 font-bold">{formattedDinnerCutoff}</strong>
            </p>
          </div>
        </div>

        {/* Date Selector Quick Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {onDateChange && (
            <>
              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className={`flex-1 sm:flex-none justify-center px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isToday
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'en' ? 'Today' : 'आज'}
              </button>
              <button
                type="button"
                onClick={() => onDateChange(tomorrowStr)}
                className={`flex-1 sm:flex-none justify-center px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isTomorrow
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'en' ? 'Tomorrow' : 'उद्या'}
              </button>
              {/* Custom Date Picker - Hidden on Mobile */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <CalendarDays className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <input
                  type="date"
                  value={forecast.date}
                  onChange={(e) => e.target.value && onDateChange(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            </>
          )}
          {!onDateChange && (
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <CalendarDays className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>{isTomorrow ? 'उद्या / Tomorrow' : forecast.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 my-3 sm:my-4">
        {/* Total Active */}
        <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-medium">{t('activeMembers')}</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {forecast.totalActiveMembers}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">नोंदणीकृत सभासद</span>
        </div>

        {/* Members on Approved Leave */}
        <div className="bg-amber-50/70 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-medium">{t('membersOnLeave')}</span>
            <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 tracking-tight">
            {forecast.membersOnLeave}
          </div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">सुट्टीमुळे जेवण नाही</span>
        </div>

        {/* Cook For */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-brand-50 to-amber-100/70 dark:from-brand-950/60 dark:to-brand-900/40 rounded-2xl p-3.5 sm:p-4 border border-brand-300 dark:border-brand-500/40 relative">
          <div className="flex items-center justify-between text-brand-800 dark:text-brand-300 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">{t('cookFor')}</span>
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 dark:text-brand-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
            {forecast.cookForCount} <span className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300">{language === 'en' ? 'members' : 'जण'}</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-brand-800/80 dark:text-brand-200/80 font-medium">महाराजांसाठी अचूक संख्या</span>
        </div>
      </div>

      {/* Meal breakdown pills & Veg/Non-Veg split */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 pt-3 border-t border-slate-150 dark:border-slate-800/80 text-xs">
        {/* Lunch */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block leading-tight">{t('lunchCount')}</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">{forecast.lunchCount}</strong>
          </div>
        </div>

        {/* Dinner */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block leading-tight">{t('dinnerCount')}</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">{forecast.dinnerCount}</strong>
          </div>
        </div>

        {/* 🟢 Veg Count */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-slate-900 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold shadow-sm">
          <div className="truncate">
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block leading-tight font-bold">
              🟢 शाकाहारी {isNonVegToday ? '(व्हेज)' : '(सर्व)'}
            </span>
            <strong className="text-emerald-700 dark:text-emerald-300 font-black text-sm">
              {isNonVegToday ? (forecast.vegCount ?? forecast.cookForCount) : forecast.cookForCount}
            </strong>
          </div>
        </div>

        {/* 🔴 Non-Veg Count */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold transition-all ${
            isNonVegToday
              ? 'bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-950 dark:to-red-900/60 border-2 border-red-500 text-red-800 dark:text-red-200 shadow-md ring-1 ring-red-400/30'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-70'
          }`}
        >
          <div className="truncate">
            <span className={`text-[10px] block leading-tight font-bold ${isNonVegToday ? 'text-red-700 dark:text-red-300' : 'text-slate-400'}`}>
              🍗 मांसाहारी {isNonVegToday ? '(फक्त रात्री)' : '(आज नाही)'}
            </span>
            <strong className={`text-sm font-black ${isNonVegToday ? 'text-red-700 dark:text-red-300' : 'text-slate-500'}`}>
              {isNonVegToday ? `${forecast.nonVegCount ?? 0} ताटे` : '0 (शाकाहारी)'}
            </strong>
          </div>
        </div>

        {/* Toggle Raw Grocery Button */}
        <button
          type="button"
          onClick={() => setShowGroceryEstimates(!showGroceryEstimates)}
          className="ml-auto text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-brand-200 dark:border-brand-800"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
          <span>{showGroceryEstimates ? 'किराणा अंदाज लपवा' : 'धान्य व किराणा अंदाज'}</span>
        </button>
      </div>

      {/* Expandable Raw Grocery Breakdown */}
      {showGroceryEstimates && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-[10px] block font-semibold">तांदूळ (भात)</span>
              <strong className="text-slate-900 dark:text-white font-mono font-black text-base">~ {estimatedRiceKg} kg</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-[10px] block font-semibold">डाळ (वरण/आमटी)</span>
              <strong className="text-slate-900 dark:text-white font-mono font-black text-base">~ {estimatedDalKg} kg</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-[10px] block font-semibold">पोळी / चपात्या</span>
              <strong className="text-slate-900 dark:text-white font-mono font-black text-base">~ {estimatedChapatiCount} नग</strong>
            </div>
            {isNonVegToday ? (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800">
                <span className="text-rose-700 dark:text-rose-300 text-[10px] block font-bold">🍗 चिकन / अंडी</span>
                <strong className="text-rose-700 dark:text-rose-300 font-mono font-black text-sm">~ {estimatedChickenKg}kg / {estimatedEggsCount} अंडी</strong>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 text-[10px] block font-semibold">भाजीपाला</span>
                <strong className="text-slate-900 dark:text-white font-mono font-black text-base">~ {estimatedVegetablesKg} kg</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
