import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MembersModule } from '../members/members.module';
import { LeavesModule } from '../leaves/leaves.module';

@Module({
  imports: [MembersModule, LeavesModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
