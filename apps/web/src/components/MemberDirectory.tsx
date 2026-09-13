'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, PlanType } from '@messmitra/types';
import {
  Search,
  UserPlus,
  Phone,
  Sun,
  Moon,
  Utensils,
  Edit2,
  MessageCircle,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
  UserCheck,
  UserX,
  CreditCard,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../lib/whatsappTemplates';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'veg' | 'nonveg'>('all');
  
  // Track which member has expanded details open (accordion or modal)
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [selectedMemberModal, setSelectedMemberModal] = useState<Member | null>(null);

  // Filter members
  const filteredMembers = members.filter((m) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      m.name.toLowerCase().includes(query) ||
      m.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
      (m.id && m.id.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    const diet = m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg');

    if (activeFilter === 'active') return m.status === 'active';
    if (activeFilter === 'inactive') return m.status === 'inactive';
    if (activeFilter === 'veg') return diet === 'veg';
    if (activeFilter === 'nonveg') return diet === 'nonveg';
    return true;
  });

  const getPlanLabel = (plan: PlanType) => {
    switch (plan) {
      case 'both':
        return 'दुपार + रात्र';
      case 'lunch':
        return 'फक्त दुपार';
      case 'dinner':
        return 'फक्त रात्र';
    }
  };

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

  const formatMemberCode = (index: number) => {
    return `#SBM-${String(index + 1).padStart(3, '0')}`;
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Header Action Bar - Separate from Search */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500" />
            <span>सभासद यादी ({members.length} एकूण)</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            नावावर क्लिक करून सविस्तर माहिती पाहा
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Excel</span>
              <span>इंपोर्ट</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddMember}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ नवीन सभासद</span>
          </button>
        </div>
      </div>

      {/* 2. Independent Search Bar with Clear Button */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder="सभासदाचे नाव किंवा मोबाइल नंबरने शोधा..."
            className="w-full pl-9 pr-9 py-2 min-h-[40px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              title="शोध साफ करा"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 min-h-[34px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-xs ${
            activeFilter === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('all')} ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('active')}
          className={`px-3 py-1.5 min-h-[34px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-xs ${
            activeFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('active')} ({members.filter((m) => m.status === 'active').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('veg')}
          className={`px-3 py-1.5 min-h-[34px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-xs ${
            activeFilter === 'veg'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🟢 व्हेज ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('nonveg')}
          className={`px-3 py-1.5 min-h-[34px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-xs ${
            activeFilter === 'nonveg'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          🔴 नॉन-व्हेज ({members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'nonveg').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('inactive')}
          className={`px-3 py-1.5 min-h-[34px] rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-xs ${
            activeFilter === 'inactive'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('inactive')} ({members.filter((m) => m.status === 'inactive').length})
        </button>
      </div>

      {/* 4. Compact Member Grid (Only Name, ID No, and WhatsApp Button Visible by Default) */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <Utensils className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">{t('noMembersFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredMembers.map((member, idx) => {
            const isVeg = (member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
            const memberCode = formatMemberCode(members.indexOf(member));
            const isExpanded = expandedMemberId === member.id;
            const waPhone = member.phone.replace(/[^0-9]/g, '');
            const waUrl = generateDirectWhatsAppUrl(
              member.phone,
              `🙏 *नमस्ते ${member.name}*,\nश्री बालाजी मेस (चालक: शंकर गिरी - ९८२२३३८९७५) कडून संदेश.`
            );

            return (
              <div
                key={member.id}
                className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
                  member.status === 'active'
                    ? isExpanded
                      ? 'border-brand-500 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-400/60'
                    : 'border-slate-200 dark:border-slate-800 opacity-65 bg-slate-50 dark:bg-slate-950/40'
                }`}
              >
                {/* Compact Row (Default View): Name, ID No, and WhatsApp Message Button */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
                  {/* Clickable Area on Member Name & ID Number to Expand Details */}
                  <button
                    type="button"
                    onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-2.5 group cursor-pointer"
                    title="सविस्तर माहिती पाहण्यासाठी क्लिक करा"
                  >
                    {/* Diet Indicator Dot / Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isVeg
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400/30'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-400/30'
                      }`}
                    >
                      {member.name.charAt(0)}
                    </div>

                    {/* Member Name and ID No */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold shrink-0">
                          {memberCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        <span className={isVeg ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                          {isVeg ? '🟢 व्हेज' : '🔴 नॉन-व्हेज'}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2">
                          {isExpanded ? 'तपशील लपवा' : 'तपशील पाहा'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* WhatsApp Message Button (Prominent 1-Tap Touch Target) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] min-w-[38px] px-2.5 flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition border border-emerald-300 dark:border-emerald-700/60 font-bold text-xs shadow-sm"
                      title={`${member.name} यांना WhatsApp मेसेज पाठवा`}
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] hidden sm:inline">WhatsApp</span>
                    </a>

                    {/* Toggle Accordion Chevron */}
                    <button
                      type="button"
                      onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                      title={isExpanded ? 'तपशील बंद करा' : 'सविस्तर तपशील उघडा'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 5. Expanded Full Details (Revealed on Clicking Member Name) */}
                {isExpanded && (
                  <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 space-y-3 animate-fadeIn">
                    {/* Phone Number & Direct Call */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                      <a
                        href={`tel:${member.phone}`}
                        className="px-3 py-1.5 min-h-[32px] flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition"
                      >
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span>कॉल करा</span>
                      </a>
                    </div>

                    {/* Diet, Plan & Rate Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">जेवण प्लॅन</span>
                        <div className="mt-0.5">{getPlanBadge(member.planType)}</div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">मासिक फी (५६ जेवणे)</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          ₹{member.rate}
                        </span>
                      </div>
                    </div>

                    {/* Join Date & Status Switch */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>प्रवेश: {member.joinDate}</span>
                      </div>

                      {/* Active / Inactive Status Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(member)}
                        className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        title="सभासद स्थिती बदला"
                      >
                        <span className={`text-[11px] ${member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {member.status === 'active' ? 'सक्रिय' : 'बंद'}
                        </span>
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

                    {/* Action Bar: Edit Member & Full View Modal */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditMember(member)}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-brand-500" />
                        <span>माहिती संपादित करा</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMemberModal(member)}
                        className="px-3 min-h-[38px] flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-300 dark:border-amber-700 transition cursor-pointer"
                        title="संपूर्ण प्रोफाइल कार्ड"
                      >
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>तपशील कार्ड</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Member Full Details Modal / Dialog (when clicking "तपशील कार्ड") */}
      {selectedMemberModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-500" />
                <span>सभासद संपूर्ण माहिती (Member Profile)</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                  {selectedMemberModal.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedMemberModal.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {formatMemberCode(members.indexOf(selectedMemberModal))} • {selectedMemberModal.phone}
                  </p>
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">आहार प्रकार (Diet):</span>
                  <span className="font-bold text-sm">
                    {(selectedMemberModal.dietPreference || (selectedMemberModal.gender === 'female' ? 'veg' : 'nonveg')) === 'veg'
                      ? '🟢 शाकाहारी (₹3,000)'
                      : '🔴 मांसाहारी (₹3,200)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">जेवण वेळ (Plan):</span>
                  <span className="font-bold">{getPlanLabel(selectedMemberModal.planType)}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">मासिक दर (Monthly Rate):</span>
                  <span className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{selectedMemberModal.rate}/महिना
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">प्रवेश तारीख (Join Date):</span>
                  <span className="font-mono">{selectedMemberModal.joinDate}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">खाते स्थिती (Status):</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedMemberModal.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {selectedMemberModal.status === 'active' ? 'सक्रिय (Active)' : 'बंद (Inactive)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${selectedMemberModal.phone}`}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>कॉल करा</span>
                </a>

                <a
                  href={generateDirectWhatsAppUrl(
                    selectedMemberModal.phone,
                    `🙏 *नमस्ते ${selectedMemberModal.name}*,\nश्री बालाजी मेस (शंकर गिरी - ९८२२३३८९७५) कडून संदेश.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp मेसेज</span>
                </a>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onEditMember(m);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-brand-500" />
                  <span>माहिती संपादित करा (Edit Profile)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
