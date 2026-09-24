import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { MembersModule } from '../members/members.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [SupabaseModule, MembersModule, ExpensesModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
