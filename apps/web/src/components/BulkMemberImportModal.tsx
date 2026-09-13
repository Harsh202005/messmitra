'use client';

import React, { useState } from 'react';
import { Member } from '@messmitra/types';
import { MessMitraApi } from '../lib/api';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Users,
} from 'lucide-react';

interface BulkMemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messId: string;
  onMembersImported: () => void;
}

interface MemberDraftRow {
  name: string;
  phone: string;
  dietPreference: 'veg' | 'nonveg';
  gender: 'male' | 'female';
  planType: 'both' | 'lunch' | 'dinner';
  rate: number;
  joinDate: string;
}

const DEFAULT_ROWS: MemberDraftRow[] = [
  {
    name: 'अमित जोशी',
    phone: '9822110011',
    dietPreference: 'veg',
    gender: 'male',
    planType: 'both',
    rate: 3000,
    joinDate: new Date().toISOString().split('T')[0],
  },
  {
    name: 'प्रतीक कांबळे',
    phone: '9822220022',
    dietPreference: 'nonveg',
    gender: 'male',
    planType: 'both',
    rate: 3200,
    joinDate: new Date().toISOString().split('T')[0],
  },
  {
    name: 'स्नेहा कुलकर्णी',
    phone: '9822330033',
    dietPreference: 'veg',
    gender: 'female',
    planType: 'both',
    rate: 3000,
    joinDate: new Date().toISOString().split('T')[0],
  },
];

export const BulkMemberImportModal: React.FC<BulkMemberImportModalProps> = ({
  isOpen,
  onClose,
  messId,
  onMembersImported,
}) => {
  const [rows, setRows] = useState<MemberDraftRow[]>(DEFAULT_ROWS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        name: '',
        phone: '',
        dietPreference: 'veg',
        gender: 'male',
        planType: 'both',
        rate: 3000,
        joinDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof MemberDraftRow, value: any) => {
    setRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: value };
      if (field === 'dietPreference') {
        row.rate = value === 'veg' ? 3000 : 3200;
      }
      copy[index] = row;
      return copy;
    });
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Name,Phone,Diet(veg/nonveg),Gender(male/female),Rate,Plan(both/lunch/dinner),JoinDate\n' +
      'Amit Joshi,9822110011,veg,male,3000,both,2026-09-01\n' +
      'Pratik Kamble,9822220022,nonveg,male,3200,both,2026-09-01\n' +
      'Sneha Kulkarni,9822330033,veg,female,3000,both,2026-09-01\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shree_balaji_members_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setStatusMsg({ type: 'error', text: 'CSV फाईल रिकामी आहे.' });
          return;
        }

        const newRows: MemberDraftRow[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 2 && cols[0]) {
            const dietPref = cols[2]?.toLowerCase().includes('non') ? 'nonveg' : 'veg';
            newRows.push({
              name: cols[0],
              phone: cols[1] || '9822338975',
              dietPreference: dietPref,
              gender: cols[3]?.toLowerCase() === 'female' ? 'female' : 'male',
              rate: Number(cols[4]) || (dietPref === 'veg' ? 3000 : 3200),
              planType: (cols[5] as any) || 'both',
              joinDate: cols[6] || new Date().toISOString().split('T')[0],
            });
          }
        }

        if (newRows.length > 0) {
          setRows(newRows);
          setStatusMsg({
            type: 'success',
            text: `CSV मधून ${newRows.length} सभासद यशस्वीरित्या लोड झाले! खाली तपासून 'सर्व सभासद जोडा' दाबा.`,
          });
        }
      } catch {
        setStatusMsg({ type: 'error', text: 'CSV फाईल वाचताना त्रुटी आली. कृपया फॉरमॅट तपासा.' });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitAll = async () => {
    const validRows = rows.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) {
      setStatusMsg({ type: 'error', text: 'कृपया किमान एका सभासदाचे नाव भरा.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const payload: Omit<Member, 'id' | 'createdAt' | 'messId'>[] = validRows.map((r) => ({
        name: r.name.trim(),
        phone: r.phone.trim() || '9822338975',
        dietPreference: r.dietPreference,
        gender: r.gender,
        planType: r.planType,
        rate: r.rate,
        joinDate: r.joinDate,
        status: 'active',
      }));

      await MessMitraApi.createMembersBulk(payload);
      onMembersImported();
      onClose();
    } catch {
      setStatusMsg({ type: 'error', text: 'सभासद जोडताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-4xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="w-12 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-200 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Production Onboarding Engine</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Excel / CSV बल्क सभासद नोंदणी (Bulk Member Onboarding)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar (Import CSV + Download Template) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition cursor-pointer min-h-[44px]">
              <Upload className="w-4 h-4" />
              <span>CSV फाईल अपलोड करा</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 font-bold rounded-xl border border-slate-300 dark:border-slate-600 transition cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>नमुना CSV डाऊनलोड (Sample Template)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन ओळ जोडा</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMsg && (
          <div
            className={`p-3 text-xs font-bold flex items-center gap-2 border-b ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Spreadsheet Table Editor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3 min-w-[160px]">सभासदाचे नाव (Full Name) *</th>
                  <th className="p-3 min-w-[140px]">फोन नंबर (Phone)</th>
                  <th className="p-3 min-w-[130px]">आहार (Diet)</th>
                  <th className="p-3 min-w-[110px]">दर (Monthly Rate)</th>
                  <th className="p-3 min-w-[130px]">जॉइन तारीख</th>
                  <th className="p-3 text-center">हटवा</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>

                    {/* Name */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.name}
                        placeholder="उदा. राहुल देशमुख"
                        onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[38px]"
                      />
                    </td>

                    {/* Phone */}
                    <td className="p-2">
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={row.phone}
                        placeholder="9822338975"
                        onChange={(e) => handleUpdateRow(idx, 'phone', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[38px]"
                      />
                    </td>

                    {/* Diet */}
                    <td className="p-2">
                      <select
                        value={row.dietPreference}
                        onChange={(e) => handleUpdateRow(idx, 'dietPreference', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[38px]"
                      >
                        <option value="veg">🟢 शाकाहारी (₹3,000)</option>
                        <option value="nonveg">🔴 मांसाहारी (₹3,200)</option>
                      </select>
                    </td>

                    {/* Rate */}
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={row.rate}
                          onChange={(e) => handleUpdateRow(idx, 'rate', Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[38px]"
                        />
                      </div>
                    </td>

                    {/* Join Date */}
                    <td className="p-2">
                      <input
                        type="date"
                        value={row.joinDate}
                        onChange={(e) => handleUpdateRow(idx, 'joinDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[38px]"
                      />
                    </td>

                    {/* Delete Row */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer min-h-[38px] min-w-[38px] inline-flex items-center justify-center"
                        title="ओळ हटवा"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            💡 टीप: आपण एकाच वेळी 50+ सभासदांची नावे CSV मधून अपलोड करू शकता. सर्व नोंदी थेट सिस्टीममध्ये तयार होतील.
          </p>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-blue-500" />
            <span>एकूण तयार होणारे सभासद: {rows.filter((r) => r.name.trim()).length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer min-h-[44px]"
            >
              रद्द करा (Cancel)
            </button>

            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting || rows.filter((r) => r.name.trim()).length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {isSubmitting ? (
                <span>जोडत आहे...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>सर्व सभासद जोडा ({rows.filter((r) => r.name.trim()).length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
