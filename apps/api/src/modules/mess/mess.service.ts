import { Injectable, NotFoundException } from '@nestjs/common';
import { Mess } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { SetupMessDto } from './dto/setup-mess.dto';
import { UpdateMessDto } from './dto/update-mess.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MessService {
  // In-memory demo fallback store
  private inMemoryMess: Mess = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Balaji Executive Dining & Mess',
    area: 'Karve Nagar / Kothrud',
    city: 'Pune',
    dailyCutoffTime: '09:00',
    ownerId: '00000000-0000-0000-0000-000000000001',
    upiId: 'balajimess@okhdfcbank',
    defaultMaleRate: 3200,
    defaultFemaleRate: 2800,
    createdAt: new Date().toISOString(),
  };

  constructor(private supabaseService: SupabaseService) {}

  async getMessDetails(user: AuthenticatedUser): Promise<Mess> {
    const client = this.supabaseService.getClient();
    if (!client || this.supabaseService.getIsMockMode()) {
      return this.inMemoryMess;
    }

    const { data, error } = await client
      .from('mess')
      .select('*')
      .eq('owner_id', user.userId)
      .single();

    if (error || !data) {
      // If user is a member, query their linked mess_id
      if (user.messId) {
        const { data: memberMess, error: memberMessError } = await client
          .from('mess')
          .select('*')
          .eq('id', user.messId)
          .single();

        if (!memberMessError && memberMess) {
          return this.mapFromDb(memberMess);
        }
      }
      throw new NotFoundException('Mess setup not found for this user');
    }

    return this.mapFromDb(data);
  }

  async setupMess(dto: SetupMessDto, user: AuthenticatedUser): Promise<Mess> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryMess = {
        ...this.inMemoryMess,
        ...dto,
        ownerId: user.userId,
        updatedAt: new Date().toISOString(),
      };
      return this.inMemoryMess;
    }

    // Insert or update mess record in Postgres
    const { data, error } = await client
      .from('mess')
      .upsert({
        name: dto.name,
        area: dto.area,
        city: dto.city,
        daily_cutoff_time: dto.dailyCutoffTime,
        owner_id: user.userId,
        upi_id: dto.upiId,
        default_male_rate: dto.defaultMaleRate,
        default_female_rate: dto.defaultFemaleRate,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save mess setup: ${error.message}`);
    }

    // Update owner's profile to link mess_id
    await client
      .from('profiles')
      .upsert({
        id: user.userId,
        mess_id: data.id,
        role: 'owner',
        full_name: user.name || 'Mess Owner',
        phone: '9822012345',
      });

    return this.mapFromDb(data);
  }

  async updateMess(dto: UpdateMessDto, user: AuthenticatedUser): Promise<Mess> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryMess = {
        ...this.inMemoryMess,
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      return this.inMemoryMess;
    }

    const { data, error } = await client
      .from('mess')
      .update({
        ...(dto.name && { name: dto.name }),
        ...(dto.area && { area: dto.area }),
        ...(dto.city && { city: dto.city }),
        ...(dto.dailyCutoffTime && { daily_cutoff_time: dto.dailyCutoffTime }),
        ...(dto.upiId && { upi_id: dto.upiId }),
        ...(dto.defaultMaleRate !== undefined && { default_male_rate: dto.defaultMaleRate }),
        ...(dto.defaultFemaleRate !== undefined && { default_female_rate: dto.defaultFemaleRate }),
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', user.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update mess: ${error.message}`);
    }

    return this.mapFromDb(data);
  }

  private mapFromDb(row: any): Mess {
    return {
      id: row.id,
      name: row.name,
      area: row.area,
      city: row.city,
      dailyCutoffTime: typeof row.daily_cutoff_time === 'string' ? row.daily_cutoff_time.substring(0, 5) : '09:00',
      ownerId: row.owner_id,
      upiId: row.upi_id,
      defaultMaleRate: Number(row.default_male_rate),
      defaultFemaleRate: Number(row.default_female_rate),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
