'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, MemberStatus, PlanType } from '@messmitra/types';
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
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MemberDirectoryProps {
  members: Member[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
  onOpenBulkImport?: () => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onAddMember,
  onEditMember,
  onToggleStatus,
  onOpenBulkImport,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'veg' | 'nonveg'>('all');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    const diet = m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg');

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
            <Sun className="w-3 h-3 text-amber-600" />
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>दुपार + रात्र</span>
          </span>
        );
      case 'lunch':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/40">
            <Sun className="w-3 h-3 text-orange-600" />
            <span>फक्त दुपार</span>
          </span>
        );
      case 'dinner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300/40">
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>फक्त रात्र</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Directory Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Bar with Min 44px Touch Target */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाव किंवा मोबाइल नंबरने शोधा..."
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenBulkImport && (
            <button
              onClick={onOpenBulkImport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <span>+ बल्क इम्पोर्ट</span>
            </button>
          )}

          <button
            onClick={onAddMember}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addMember')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs - Horizontal Scroll on Mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('all')} ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-2 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('active')} ({members.filter((m) => m.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('veg')}
          className={`px-3 py-2 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            activeTab === 'veg'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🟢 शाकाहारी (₹3,000) ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg').length})
        </button>
        <button
          onClick={() => setActiveTab('nonveg')}
          className={`px-3 py-2 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            activeTab === 'nonveg'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🔴 मांसाहारी (₹3,200) ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'nonveg').length})
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-3 py-2 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            activeTab === 'inactive'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('inactive')} ({members.filter((m) => m.status === 'inactive').length})
        </button>
      </div>

      {/* Members List (Mobile Stacked Cards & Desktop Grid) */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">{t('noMembersFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredMembers.map((member) => {
            const isVeg = (member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
            return (
              <div
                key={member.id}
                className={`rounded-2xl p-4 transition-all duration-200 border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                  member.status === 'active'
                    ? 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-950/40'
                }`}
              >
                <div>
                  {/* Top Row: Name, Diet, Status Switch */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isVeg
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isVeg ? '🟢 शाकाहारी' : '🔴 मांसाहारी'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    </div>

                    {/* Quick Status Toggle (44px tap zone) */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(member)}
                        title={member.status === 'active' ? 'Active' : 'Inactive'}
                        className={`p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer`}
                      >
                        <div
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                              member.status === 'active' ? 'translate-x-[18px]' : 'translate-x-1'
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Plan & Rate */}
                  <div className="flex items-center justify-between gap-2 py-2 border-t border-b border-slate-100 dark:border-slate-800/80 my-2">
                    <div>{getPlanBadge(member.planType)}</div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                        ₹{member.rate}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ महिना (५६ जेवणे)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar (Large touch targets for Mobile) */}
                <div className="flex items-center justify-between pt-1 gap-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{member.joinDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Call Button */}
                    <a
                      href={`tel:${member.phone}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
                      title="कॉल करा"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition border border-emerald-300 dark:border-emerald-700/50"
                      title="WhatsApp मेसेज"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditMember(member)}
                      className="min-h-[40px] px-3 flex items-center gap-1 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title={t('editMember')}
                    >
                      <Edit2 className="w-3 h-3 text-brand-500" />
                      <span>संपादित</span>
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
