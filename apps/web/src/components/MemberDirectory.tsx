'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, MemberStatus, Gender, PlanType } from '@messmitra/types';
import {
  Search,
  UserPlus,
  Phone,
  Sun,
  Moon,
  Utensils,
  Edit2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Calendar,
} from 'lucide-react';

interface MemberDirectoryProps {
  members: Member[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onAddMember,
  onEditMember,
  onToggleStatus,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'veg' | 'nonveg'>('all');

  const filteredMembers = members.filter((m) => {
    // Search filter
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    const diet = m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg');

    // Tab filter
    if (activeTab === 'active') return m.status === 'active';
    if (activeTab === 'inactive') return m.status === 'inactive';
    if (activeTab === 'veg') return diet === 'veg';
    if (activeTab === 'nonveg') return diet === 'nonveg';
    return true;
  });

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case 'both':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
            <Sun className="w-3 h-3 text-amber-500" />
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>{t('bothMeals')}</span>
          </span>
        );
      case 'lunch':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/40">
            <Sun className="w-3 h-3 text-orange-500" />
            <span>{t('lunchOnly')}</span>
          </span>
        );
      case 'dinner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300/40">
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>{t('dinnerOnly')}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Directory Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>

        {/* Add Member Button */}
        <button
          onClick={onAddMember}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition self-stretch sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addMember')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('all')} ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('active')} ({members.filter((m) => m.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            activeTab === 'inactive'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('inactive')} ({members.filter((m) => m.status === 'inactive').length})
        </button>
        <button
          onClick={() => setActiveTab('veg')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            activeTab === 'veg'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🟢 शाकाहारी (Veg - ₹3,000) ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg').length})
        </button>
        <button
          onClick={() => setActiveTab('nonveg')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            activeTab === 'nonveg'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🔴 मांसाहारी (Non-Veg - ₹3,200) ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'nonveg').length})
        </button>
      </div>

      {/* Members List (Card View / Desktop Table) */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Utensils className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">{t('noMembersFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isVeg = (member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
            return (
            <div
              key={member.id}
              className={`rounded-2xl p-4 transition-all duration-200 border relative bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                member.status === 'active'
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-950/40'
              }`}
            >
              {/* Header: Name & Diet Badge */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {member.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isVeg
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isVeg ? '🟢 व्हेज' : '🔴 नॉन-व्हेज'}
                    </span>
                  </div>
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-500 transition mt-0.5 font-mono"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{member.phone}</span>
                  </a>
                </div>

                {/* Quick Status Toggle Switch */}
                <button
                  onClick={() => onToggleStatus(member)}
                  title={member.status === 'active' ? 'Active (Click to Inactivate)' : 'Inactive (Click to Activate)'}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      member.status === 'active' ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Badges & Rate */}
              <div className="flex items-center justify-between gap-2 py-2 border-t border-b border-slate-100 dark:border-slate-800/80 my-2">
                <div>{getPlanBadge(member.planType)}</div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{member.rate}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ महिना (Month)</span>
                </div>
              </div>

              {/* Footer metadata & Actions */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{member.joinDate}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* WhatsApp Quick Link */}
                  <a
                    href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                    title="WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEditMember(member)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title={t('editMember')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
