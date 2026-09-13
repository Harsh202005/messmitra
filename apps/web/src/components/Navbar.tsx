'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import {
  Utensils,
  Settings,
  Users,
  CalendarDays,
  CreditCard,
  TrendingDown,
  PieChart,
  Cloud,
  LogOut,
  ShieldCheck,
  Crown,
  ChefHat,
  User,
  LogIn,
  Sun,
  Moon,
  MoreVertical,
  QrCode,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  X,
  LayoutDashboard,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { Mess } from '@messmitra/types';

export type ActiveTab = 'members' | 'leaves' | 'billing' | 'expenses' | 'pnl';
export type UserViewRole = 'owner' | 'member' | 'staff';

interface NavbarProps {
  mess: Mess | null;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  viewRole: UserViewRole;
  onToggleViewRole: (role: UserViewRole) => void;
  onOpenSettings: () => void;
  onOpenCloudSync: () => void;
  onOpenLogin: () => void;
  onOpenBulkImport?: () => void;
  onOpenQrPoster?: () => void;
  onOpenWhatsAppBroadcast?: () => void;
  onToggleMobileSimulator?: () => void;
  isMobileSimulator?: boolean;
  pendingLeavesCount?: number;
  pendingRegistrationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  mess,
  activeTab,
  onSelectTab,
  viewRole,
  onToggleViewRole,
  onOpenSettings,
  onOpenCloudSync,
  onOpenLogin,
  onOpenBulkImport,
  onOpenQrPoster,
  onOpenWhatsAppBroadcast,
  onToggleMobileSimulator,
  isMobileSimulator = false,
  pendingLeavesCount = 0,
  pendingRegistrationsCount = 0,
}) => {
  const { language, setLanguage, t } = useI18n();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2">
            {/* Brand Logo & Mess Name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                    {t('appName')}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 uppercase shrink-0">
                    २१ वर्षे
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                  २१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Owner Mode only) */}
            {viewRole === 'owner' && (
              <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
                <button
                  onClick={() => onSelectTab('members')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-brand-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('members')}</span>
                  {pendingRegistrationsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => onSelectTab('leaves')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'leaves'
                      ? 'bg-brand-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{t('leaves')}</span>
                  {pendingLeavesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                      {pendingLeavesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onSelectTab('billing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'billing'
                      ? 'bg-brand-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('billing')}</span>
                </button>

                <button
                  onClick={() => onSelectTab('expenses')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'expenses'
                      ? 'bg-brand-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{t('expenses')}</span>
                </button>

                <button
                  onClick={() => onSelectTab('pnl')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'pnl'
                      ? 'bg-brand-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span>{t('pnl')}</span>
                </button>
              </nav>
            )}

            {/* Right Action Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Light / Dark Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span className="hidden lg:inline text-[11px]">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Temporary Mobile View Test Button (Can be removed later) */}
              {onToggleMobileSimulator && (
                <button
                  onClick={onToggleMobileSimulator}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isMobileSimulator
                      ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                      : 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-400/50 hover:bg-amber-500/25'
                  }`}
                  title={isMobileSimulator ? 'फुल स्क्रीन डेस्कटॉप मोडवर परत जा' : 'मोबाईल स्क्रीन व्ह्यू टेस्ट करा (375px)'}
                >
                  {isMobileSimulator ? (
                    <Monitor className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  )}
                  <span className="hidden sm:inline">
                    {isMobileSimulator ? 'Full Screen' : '📱 मोबाईल व्ह्यू'}
                  </span>
                </button>
              )}

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-medium">
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-1.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                    language === 'mr'
                      ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                    language === 'en'
                      ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* User Account / Role Trigger */}
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="रोल किंवा खाते बदला"
              >
                {role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                {role === 'member' && <User className="w-3.5 h-3.5 text-blue-500" />}
                {role === 'staff' && <ChefHat className="w-3.5 h-3.5 text-emerald-500" />}

                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 hidden sm:inline truncate max-w-[90px]">
                  {user?.name?.split(' ')[0] || (role === 'owner' ? 'शंकर गिरी' : role === 'staff' ? 'आचारी' : 'सभासद')}
                </span>

                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                    role === 'owner'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300'
                      : role === 'staff'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300'
                  }`}
                >
                  {role === 'owner' ? 'मालक' : role === 'staff' ? 'आचारी' : 'सभासद'}
                </span>
              </button>

              {/* Mobile "More" Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="अधिक पर्याय (More Menu)"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Desktop Quick Settings Button */}
              {role === 'owner' && (
                <button
                  onClick={onOpenSettings}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                  title={t('editSettings')}
                >
                  <Settings className="w-3.5 h-3.5 text-brand-500" />
                  <span className="hidden xl:inline">{t('setupWizard')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly & fixed at screen bottom on phones) */}
      {viewRole === 'owner' && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around px-1 py-1.5 safe-area-inset-bottom">
          <button
            onClick={() => onSelectTab('members')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition cursor-pointer relative ${
              activeTab === 'members'
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/60 dark:bg-brand-950/40'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">सभासद</span>
            {pendingRegistrationsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('leaves')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition cursor-pointer relative ${
              activeTab === 'leaves'
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/60 dark:bg-brand-950/40'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">सुट्ट्या</span>
            {pendingLeavesCount > 0 && (
              <span className="absolute top-1 right-2 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[8px] font-bold">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('billing')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'billing'
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/60 dark:bg-brand-950/40'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">बिलिंग</span>
          </button>

          <button
            onClick={() => onSelectTab('expenses')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'expenses'
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/60 dark:bg-brand-950/40'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <TrendingDown className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">खर्च</span>
          </button>

          <button
            onClick={() => onSelectTab('pnl')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'pnl'
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/60 dark:bg-brand-950/40'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">नफा-तोटा</span>
          </button>
        </nav>
      )}

      {/* MOBILE "MORE" BOTTOM SHEET DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Drawer Drag Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  श्री बालाजी मेस • अधिक टूल्स
                </h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {onOpenQrPoster && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenQrPoster();
                  }}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
                >
                  <QrCode className="w-5 h-5 text-amber-600" />
                  <span>नोंदणी QR पोस्टर</span>
                </button>
              )}

              {onOpenWhatsAppBroadcast && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWhatsAppBroadcast();
                  }}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>WhatsApp ब्रॉडकास्ट</span>
                </button>
              )}

              {onOpenBulkImport && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBulkImport();
                  }}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <span>Excel बल्क नोंदणी</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
              >
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span>मेस सेटिंग्ज</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCloudSync();
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
              >
                <Cloud className="w-5 h-5 text-emerald-500" />
                <span>क्लाउड बॅकअप</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-200 font-bold flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer min-h-[52px]"
              >
                <LogIn className="w-5 h-5 text-brand-600" />
                <span>खाते / रोल बदला</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
