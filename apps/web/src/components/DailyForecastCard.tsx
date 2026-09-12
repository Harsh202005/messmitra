'use client';

import React from 'react';
import { useI18n } from '../lib/i18n';
import { DailyCookForecast } from '@messmitra/types';
import { ChefHat, Users, UserX, Sun, Moon, CalendarDays, Sparkles } from 'lucide-react';

interface DailyForecastCardProps {
  forecast: DailyCookForecast;
  cutoffTime?: string;
  onDateChange?: (date: string) => void;
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ forecast, cutoffTime = '09:00', onDateChange }) => {
  const { t } = useI18n();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const isToday = forecast.date === todayStr;
  const isTomorrow = forecast.date === tomorrowStr;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 shadow-xl border border-slate-700/60">
      {/* Background glowing ambient light */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30 shadow-inner">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
              {isTomorrow ? t('tomorrowForecast') : `जेवण अंदाज (${forecast.date})`}
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Auto-computed
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              तारीख: <strong className="text-slate-200">{forecast.date}</strong> • {t('cutoffTime')}: <strong className="text-slate-200">{cutoffTime} AM</strong>
            </p>
          </div>
        </div>

        {/* Date Selector Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {onDateChange && (
            <>
              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isToday
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                आज (Today)
              </button>
              <button
                type="button"
                onClick={() => onDateChange(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isTomorrow
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                उद्या (Tomorrow)
              </button>
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
                <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
                <input
                  type="date"
                  value={forecast.date}
                  onChange={(e) => e.target.value && onDateChange(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            </>
          )}
          {!onDateChange && (
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
              <span>{isTomorrow ? 'उद्या / Tomorrow' : forecast.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        {/* Total Active */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{t('activeMembers')}</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {forecast.totalActiveMembers}
          </div>
          <span className="text-[11px] text-slate-400">नोंदणीकृत सभासद</span>
        </div>

        {/* Members on Approved Leave */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{t('membersOnLeave')}</span>
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {forecast.membersOnLeave}
          </div>
          <span className="text-[11px] text-amber-400/80">सुट्टीमुळे जेवण नाही</span>
        </div>

        {/* Cook For (Net Count) */}
        <div className="bg-gradient-to-br from-brand-950/60 to-brand-900/40 rounded-xl p-4 border border-brand-500/40 relative">
          <div className="flex items-center justify-between text-brand-300 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('cookFor')}</span>
            <ChefHat className="w-5 h-5 text-brand-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-brand-400 tracking-tight">
            {forecast.cookForCount} <span className="text-sm font-normal text-slate-300">जण (Heads)</span>
          </div>
          <span className="text-[11px] text-brand-200/80 font-medium">महाराजांसाठी अचूक संख्या</span>
        </div>
      </div>

      {/* Meal breakdown pills */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">{t('lunchCount')}:</span>
          <strong className="text-white font-bold text-sm">{forecast.lunchCount}</strong>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Moon className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-300">{t('dinnerCount')}:</span>
          <strong className="text-white font-bold text-sm">{forecast.dinnerCount}</strong>
        </div>
      </div>
    </div>
  );
};
