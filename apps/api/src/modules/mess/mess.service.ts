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
    name: 'श्री बालाजी मेस',
    area: 'कर्वे नगर / कोथरूड',
    city: 'पुणे',
    dailyCutoffTime: '18:00',
    lunchCutoffTime: '09:00',
    dinnerCutoffTime: '18:00',
    ownerId: '00000000-0000-0000-0000-000000000001',
    ownerName: 'शंकर गिरी',
    contactNumber: '+91 98223 38975',
    upiId: '9822338975@upi',
    defaultMaleRate: 3200,
    defaultFemaleRate: 3000,
    defaultVegRate: 3000,
    defaultNonVegRate: 3200,
    tagline: 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
    establishedYears: 21,
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
      name: row.name || 'श्री बालाजी मेस',
      area: row.area || 'कर्वे नगर / कोथरूड',
      city: row.city || 'पुणे',
      dailyCutoffTime: typeof row.daily_cutoff_time === 'string' ? row.daily_cutoff_time.substring(0, 5) : '18:00',
      lunchCutoffTime: typeof row.lunch_cutoff_time === 'string' ? row.lunch_cutoff_time.substring(0, 5) : '09:00',
      dinnerCutoffTime: typeof row.dinner_cutoff_time === 'string' ? row.dinner_cutoff_time.substring(0, 5) : '18:00',
      ownerId: row.owner_id,
      ownerName: row.owner_name || 'शंकर गिरी',
      contactNumber: row.contact_number || '+91 98223 38975',
      upiId: row.upi_id || '9822338975@upi',
      defaultMaleRate: Number(row.default_male_rate || 3200),
      defaultFemaleRate: Number(row.default_female_rate || 3000),
      defaultVegRate: Number(row.default_veg_rate || row.default_female_rate || 3000),
      defaultNonVegRate: Number(row.default_nonveg_rate || row.default_male_rate || 3200),
      tagline: row.tagline || 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
      establishedYears: Number(row.established_years || 21),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
