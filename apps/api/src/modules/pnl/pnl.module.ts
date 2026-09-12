import { Module } from '@nestjs/common';
import { PnLController } from './pnl.controller';
import { PnLService } from './pnl.service';
import { BillingModule } from '../billing/billing.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [BillingModule, ExpensesModule],
  controllers: [PnLController],
  providers: [PnLService],
  exports: [PnLService],
})
export class PnLModule {}
