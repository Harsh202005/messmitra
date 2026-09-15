'use client';

import React, { useState, useEffect } from 'react';
import {
  InAppNotification,
  getStoredNotifications,
  markNotificationAsRead,
} from '../lib/notificationService';
import {
  Bell,
  X,
  Sparkles,
  DollarSign,
  Utensils,
  Clock,
  Calendar,
  Ticket,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<InAppNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for local new notification event
    const handleNewNotification = (e: Event) => {
      const customEvt = e as CustomEvent<InAppNotification>;
      if (customEvt.detail) {
        setActiveNotification(customEvt.detail);
        setIsVisible(true);
      }
    };

    // Auto dismiss banner after 7 seconds when activeNotification changes
    let timer: any = null;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    }

    // Listen for cross-tab BroadcastChannel notifications
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('messmitra_notification_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_NOTIFICATION' && event.data?.notification) {
            setActiveNotification(event.data.notification);
            setIsVisible(true);
          }
        };
      }
    } catch (e) {
      // ignore
    }

    window.addEventListener('messmitra_new_notification', handleNewNotification);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('messmitra_new_notification', handleNewNotification);
      if (channel) {
        channel.close();
      }
    };
  }, [isVisible]);

  if (!activeNotification || !isVisible) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'dues':
        return <DollarSign className="w-5 h-5 text-amber-500" />;
      case 'sunday_special':
        return <Utensils className="w-5 h-5 text-emerald-500" />;
      case 'cutoff':
        return <Clock className="w-5 h-5 text-rose-500" />;
      case 'leave':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'token':
        return <Ticket className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (activeNotification) {
      markNotificationAsRead(activeNotification.id);
    }
  };

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounceIn shadow-2xl">
      <div className="bg-slate-900/95 text-white dark:bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-2.5">
        {/* Top Header: App Identity & Time */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <div className="w-4 h-4 rounded-full overflow-hidden border border-amber-400/50 flex-shrink-0">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span>श्री बालाजी मेस</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block ml-1" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px]">आत्ताच (Just now)</span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="बंद करा"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
              {activeNotification.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {activeNotification.body}
            </p>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-800/80 text-xs">
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>मोबाईल पुश सूचना</span>
          </span>

          <button
            onClick={handleDismiss}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>समजले (OK)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
