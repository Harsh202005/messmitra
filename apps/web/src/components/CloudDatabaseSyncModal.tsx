'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CloudDatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadAllData: () => Promise<void>;
}

export const CloudDatabaseSyncModal: React.FC<CloudDatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onReloadAllData,
}) => {
  const { t } = useI18n();

  const [supabaseUrl, setSupabaseUrl] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('messmitra_supabase_url') || '' : ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('messmitra_supabase_key') || '' : ''
  );
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setConnectionStatus('failed');
        return;
      }
      // Test fetch to Supabase REST endpoint
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/mess?select=count`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (res.ok) {
        setConnectionStatus('success');
        localStorage.setItem('messmitra_supabase_url', supabaseUrl);
        localStorage.setItem('messmitra_supabase_key', supabaseAnonKey);
      } else {
        setConnectionStatus('failed');
      }
    } catch {
      setConnectionStatus('failed');
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Run this in your free Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.mess (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    daily_cutoff_time TIME NOT NULL DEFAULT '09:00:00',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upi_id VARCHAR(255) NOT NULL,
    default_male_rate NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    default_female_rate NUMERIC(10, 2) NOT NULL DEFAULT 2800.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mess ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view and update their own mess" ON public.mess FOR ALL USING (owner_id = auth.uid());`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleLoadDemoData = async () => {
    setIsSyncing(true);
    try {
      localStorage.removeItem('messmitra_members');
      localStorage.removeItem('messmitra_leaves');
      localStorage.removeItem('messmitra_mess');
      await onReloadAllData();
      setToast('पुणे मेसचा संपूर्ण डेमो डेटा लोड झाला! ✨');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-bounce">
            {toast}
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">क्लाउड डेटाबेस व सिंक (Free Supabase Cloud)</h3>
              <p className="text-xs text-slate-400">मोफत ऑनलाइन डेटाबेस जोडा किंवा लोकल ऑफलाइन मोड वापरा</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Free Supabase Cloud Callout */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Free Supabase Database (500MB Free Forever)</span>
              </span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>खाते उघडा (Sign Up)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 leading-relaxed">
              तुमचा डेटा सुरक्षित ठेवण्यासाठी मोफत Supabase प्रोजेक्ट तयार करून खालील कळा (Credentials) प्रविष्ट करा:
            </p>

            <div className="space-y-2 pt-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Anon / Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>कनेक्शन तपासा (Test Connection)</span>
              </button>

              <div>
                {connectionStatus === 'success' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>कनेक्ट झाले ✅</span>
                  </span>
                )}
                {connectionStatus === 'failed' && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>ऑफलाइन लोकल मोड सक्रिय</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Copy SQL Schema / Load Demo Dataset) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={copySqlSchema}
              className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition text-left"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-400" />}
              <div>
                <strong className="block text-slate-200">Supabase SQL कॉपी करा</strong>
                <span className="text-[10px] text-slate-400">1-क्लिक RLS स्कीमा DDL</span>
              </div>
            </button>

            <button
              onClick={handleLoadDemoData}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition text-left"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <strong className="block text-slate-200">डेमो डेटा रीलोड करा</strong>
                <span className="text-[10px] text-slate-400">बाळाजी मेस, पुणे (12 सभासद)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
