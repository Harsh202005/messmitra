import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { MessModule } from './modules/mess/mess.module';
import { MembersModule } from './modules/members/members.module';
import { LeavesModule } from './modules/leaves/leaves.module';
import { BillingModule } from './modules/billing/billing.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PnLModule } from './modules/pnl/pnl.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    SupabaseModule,
    AuthModule,
    MessModule,
    MembersModule,
    LeavesModule,
    BillingModule,
    ExpensesModule,
    PnLModule,
  ],
})
export class AppModule {}
