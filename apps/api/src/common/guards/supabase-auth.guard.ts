import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../modules/supabase/supabase.service';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Support Demo / Local Dev header or mock mode fallback
    if (!authHeader || authHeader === 'Bearer demo-owner-token' || this.supabaseService.getIsMockMode()) {
      request.user = {
        userId: '00000000-0000-0000-0000-000000000001',
        messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        role: 'owner',
        email: 'owner@balajimess.com',
        name: 'Ganesh Balaji Patil',
      } as AuthenticatedUser;
      return true;
    }

    const token = authHeader.replace('Bearer ', '');
    const client = this.supabaseService.getClient();

    if (!client) {
      throw new UnauthorizedException('Supabase client unavailable');
    }

    try {
      const { data: { user }, error } = await client.auth.getUser(token);
      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired authentication token');
      }

      // Fetch user profile and mess tenancy
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('mess_id, role, full_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback for newly registered owner completing setup wizard
        request.user = {
          userId: user.id,
          messId: '',
          role: 'owner',
          email: user.email,
          name: user.user_metadata?.full_name || 'Mess Owner',
        } as AuthenticatedUser;
        return true;
      }

      request.user = {
        userId: user.id,
        messId: profile.mess_id,
        role: profile.role,
        email: user.email,
        name: profile.full_name,
      } as AuthenticatedUser;

      return true;
    } catch (err) {
      this.logger.error(`Authentication error: ${err.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
