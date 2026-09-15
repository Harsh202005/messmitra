// Free-tier In-App and Web Push Notification Service
// Works 100% free with browser standard Web Notification API, Web Audio chime synthesis, and localStorage / BroadcastChannel syncing.

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'dues' | 'sunday_special' | 'cutoff' | 'leave' | 'general' | 'token';
  timestamp: string;
  isRead: boolean;
  targetAudience: 'all' | 'unpaid' | 'veg' | 'nonveg';
  sender: string;
  actionUrl?: string;
  actionLabel?: string;
}

const STORAGE_KEY = 'messmitra_notifications_list';
const BROADCAST_CHANNEL_NAME = 'messmitra_notification_channel';

// Play a pleasant 2-tone notification sound chime using Web Audio API (No external sound file required!)
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: High crisp pleasant chime (C6 ~ 1046Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: Harmonic pleasant high bell (E6 ~ 1318Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.48);
  } catch (e) {
    console.warn('Web Audio chime could not play', e);
  }
};

// Trigger device vibration if supported on mobile
export const triggerDeviceVibration = () => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
  } catch (e) {
    // ignore
  }
};

// Request Web Push Notification permission from browser
export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    return 'denied';
  }
};

// Show system push notification
export const showSystemPushNotification = (title: string, body: string, icon = '/logo.jpeg') => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'messmitra-alert-' + Date.now(),
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('System notification failed', e);
  }
};

// Retrieve all stored notifications
export const getStoredNotifications = (): InAppNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Default initial welcome notification
      const defaultNotifs: InAppNotification[] = [
        {
          id: 'welcome-1',
          title: 'श्री बालाजी मेस - स्वागत आहे! 🍛',
          body: '२१ वर्षांची अखंड परंपरा. मोफत मोबाईल व इन-ॲप सूचना प्रणाली सक्रिय आहे.',
          type: 'general',
          timestamp: new Date().toISOString(),
          isRead: false,
          targetAudience: 'all',
          sender: 'श्री बालाजी मेस',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Broadcast a new in-app & mobile push notification to all users/devices
export const broadcastInAppNotification = (params: {
  title: string;
  body: string;
  type: InAppNotification['type'];
  targetAudience?: InAppNotification['targetAudience'];
  sender?: string;
  actionUrl?: string;
  actionLabel?: string;
}): InAppNotification => {
  const newNotif: InAppNotification = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: params.title,
    body: params.body,
    type: params.type,
    targetAudience: params.targetAudience || 'all',
    sender: params.sender || 'श्री बालाजी मेस (व्यवस्थापक)',
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: params.actionUrl,
    actionLabel: params.actionLabel,
  };

  if (typeof window !== 'undefined') {
    // 1. Save to localStorage
    const existing = getStoredNotifications();
    const updated = [newNotif, ...existing].slice(0, 50); // Keep latest 50
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist notification', e);
    }

    // 2. Play sound & vibrate
    playNotificationChime();
    triggerDeviceVibration();

    // 3. Show native Web Push Notification if permitted
    showSystemPushNotification(newNotif.title, newNotif.body);

    // 4. Dispatch local DOM custom event for instant UI banner
    window.dispatchEvent(
      new CustomEvent('messmitra_new_notification', { detail: newNotif })
    );

    // 5. Broadcast to all open tabs / windows via BroadcastChannel
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: 'NEW_NOTIFICATION', notification: newNotif });
        channel.close();
      }
    } catch (e) {
      // ignore
    }
  }

  return newNotif;
};

// Mark single notification as read
export const markNotificationAsRead = (id: string) => {
  if (typeof window === 'undefined') return;
  const list = getStoredNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('messmitra_notifications_updated'));
};

// Mark all as read
export const markAllNotificationsAsRead = () => {
  if (typeof window === 'undefined') return;
  const list = getStoredNotifications();
  const updated = list.map((n) => ({ ...n, isRead: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('messmitra_notifications_updated'));
};

// Clear all notifications
export const clearAllNotifications = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('messmitra_notifications_updated'));
};
