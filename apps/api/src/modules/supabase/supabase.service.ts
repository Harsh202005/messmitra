import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient | null = null;
  private isMockMode: boolean = false;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase-url')) {
      try {
        // Polyfill WebSocket for Node < 22 (uses the 'ws' npm package)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const WebSocketImpl = require('ws');
        if (typeof globalThis.WebSocket === 'undefined') {
          (globalThis as any).WebSocket = WebSocketImpl;
        }

        this.supabaseClient = createClient(supabaseUrl, supabaseKey);
        this.logger.log('✅ Connected to Supabase Postgres instance with RLS.');
      } catch (err) {
        this.logger.warn(
          `⚠️ Supabase client init failed (${err.message}), falling back to In-Memory Demo Store.`
        );
        this.isMockMode = true;
      }
    } else {
      this.isMockMode = true;
      this.logger.warn(
        '⚠️ SUPABASE_URL not configured or using placeholders. Running in In-Memory Demo Store mode.'
      );
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  getIsMockMode(): boolean {
    return this.isMockMode;
  }
}
