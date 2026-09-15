'use client';

import React, { useState, useEffect } from 'react';
import {
  InAppNotification,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  requestPushPermission,
  showSystemPushNotification,
  playNotificationChime,
} from '../lib/notificationService';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  Smartphone,
  DollarSign,
  Utensils,
  Clock,
  Calendar,
  Ticket,
  CheckCircle2,
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');

  const refreshList = () => {
    const list = getStoredNotifications();
    setNotifications(list);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  };

  useEffect(() => {
    refreshList();

    const handleUpdate = () => refreshList();
    window.addEventListener('messmitra_notifications_updated', handleUpdate);
    window.addEventListener('messmitra_new_notification', handleUpdate);

    return () => {
      window.removeEventListener('messmitra_notifications_updated', handleUpdate);
      window.removeEventListener('messmitra_new_notification', handleUpdate);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEnablePush = async () => {
    const res = await requestPushPermission();
    setPushStatus(res);
    if (res === 'granted') {
      playNotificationChime();
      showSystemPushNotification(
        'श्री बालाजी मेस - सूचना चालू झाल्या! 🔔',
        'तुम्हाला आता मेसचे नवीन मेसेज व स्मरणपत्र मोबाईलवर मिळतील.'
      );
    }
  };

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'dues':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'sunday_special':
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      case 'cutoff':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'leave':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'token':
        return <Ticket className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        title="सूचना केंद्र (Notification Center)"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer / Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[80vh] animate-scaleIn">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    सूचना केंद्र (Notifications)
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {unreadCount} न वाचलेल्या सूचना
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Permission Banner if not granted */}
            {pushStatus !== 'granted' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] text-amber-900 dark:text-amber-200">
                    मोबाईल पुश सूचना चालू करा
                  </span>
                </div>
                <button
                  onClick={handleEnablePush}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-lg transition cursor-pointer shrink-0"
                >
                  चालू करा
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700 opacity-50" />
                  <span>कोणतीही नवीन सूचना नाही.</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/70 transition cursor-pointer ${
                      !notif.isRead ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </h5>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {notif.body}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {notif.sender}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[11px]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>सर्व वाचलेले चिन्हांकित करा</span>
                </button>

                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 transition cursor-pointer text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>साफ करा</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
