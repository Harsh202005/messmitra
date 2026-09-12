import React from 'react';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
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
}) => {
  const { language, setLanguage, t } = useI18n();
  const { user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Mess Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-glow flex-shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  {t('appName')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300 uppercase">
                  PWA Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {mess?.name ? `${mess.name} • ${mess.city}` : t('tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Owner Mode only) */}
          {viewRole === 'owner' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => onSelectTab('members')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'members'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('members')}</span>
              </button>

              <button
                onClick={() => onSelectTab('leaves')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'leaves'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{t('leaves')}</span>
              </button>

              <button
                onClick={() => onSelectTab('billing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'billing'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t('billing')}</span>
              </button>

              <button
                onClick={() => onSelectTab('expenses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'expenses'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{t('expenses')}</span>
              </button>

              <button
                onClick={() => onSelectTab('pnl')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'pnl'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>{t('pnl')}</span>
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Database Cloud Sync Status Button */}
            <button
              onClick={onOpenCloudSync}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Cloud Database Sync & Settings"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Cloud DB</span>
            </button>

            {/* Authenticated User Role Badge & Login Trigger */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 pl-2 pr-1.5 py-1 rounded-xl border border-slate-700/80">
              <div className="flex items-center gap-1.5">
                {role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                {role === 'member' && <User className="w-3.5 h-3.5 text-blue-400" />}
                {role === 'staff' && <ChefHat className="w-3.5 h-3.5 text-emerald-400" />}

                <span className="text-[11px] font-bold text-slate-200 hidden sm:inline truncate max-w-[110px]">
                  {user?.name?.split(' ')[0] || (role === 'owner' ? 'Owner' : role === 'staff' ? 'Cook' : 'Member')}
                </span>

                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                    role === 'owner'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : role === 'staff'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {role === 'owner' ? 'OWNER' : role === 'staff' ? 'COOK' : 'MEMBER'}
                </span>
              </div>

              <button
                onClick={onOpenLogin}
                className="ml-1 px-2 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                title="रोल किंवा खाते बदला (Switch Account / Login with ID & Password)"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden md:inline">बदला</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setLanguage('mr')}
                className={`px-1.5 py-1 rounded transition ${
                  language === 'mr'
                    ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-1 rounded transition ${
                  language === 'hi'
                    ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-1 rounded transition ${
                  language === 'en'
                    ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Mess Settings Button (Owner only) */}
            {role === 'owner' && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                title={t('editSettings')}
              >
                <Settings className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden lg:inline">{t('setupWizard')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {viewRole === 'owner' && (
          <nav className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => onSelectTab('members')}
              className={`py-1 px-2 rounded-lg transition ${
                activeTab === 'members' ? 'text-brand-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              सभासद
            </button>
            <button
              onClick={() => onSelectTab('leaves')}
              className={`py-1 px-2 rounded-lg transition ${
                activeTab === 'leaves' ? 'text-brand-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              सुट्ट्या
            </button>
            <button
              onClick={() => onSelectTab('billing')}
              className={`py-1 px-2 rounded-lg transition ${
                activeTab === 'billing' ? 'text-brand-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              बिलिंग
            </button>
            <button
              onClick={() => onSelectTab('expenses')}
              className={`py-1 px-2 rounded-lg transition ${
                activeTab === 'expenses' ? 'text-brand-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              खर्च
            </button>
            <button
              onClick={() => onSelectTab('pnl')}
              className={`py-1 px-2 rounded-lg transition ${
                activeTab === 'pnl' ? 'text-brand-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              P&L
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
