import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration or local storage overrides
export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return { url, key, isConfigured: Boolean(url && key && !url.includes('your-supabase')) };
  }

  const localUrl = localStorage.getItem('messmitra_supabase_url');
  const localKey = localStorage.getItem('messmitra_supabase_key');
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';
  const isConfigured = Boolean(url && key && !url.includes('your-supabase'));

  return { url, key, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;
let lastConfigUrl = '';
let lastConfigKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance || lastConfigUrl !== url || lastConfigKey !== key) {
    lastConfigUrl = url;
    lastConfigKey = key;
    supabaseInstance = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}

/**
 * Realtime hook helper to listen for all postgres table changes
 */
export function subscribeToMessRealtime(
  messId: string,
  onDataChange: (payload: { table: string; eventType: string; newRow: any; oldRow: any }) => void
) {
  const client = getSupabase();
  if (!client) return () => {};

  const channelName = `mess-realtime-${messId || 'all'}`;
  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
      },
      (payload) => {
        console.log('⚡ Realtime Postgres Change Event received:', payload.table, payload.eventType);
        onDataChange({
          table: payload.table,
          eventType: payload.eventType,
          newRow: payload.new,
          oldRow: payload.old,
        });
      }
    )
    .subscribe((status) => {
      console.log(`🔌 Supabase Realtime Channel [${channelName}] status:`, status);
    });

  return () => {
    client.removeChannel(channel);
  };
}
