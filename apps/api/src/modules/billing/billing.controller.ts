import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { RecordPaymentDto, RecordAdjustmentDto } from './dto/record-payment.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Billing & Accounting')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'Get monthly billing ledger with totals and member bills' })
  @ApiQuery({ name: 'month', required: false, example: '2026-09' })
  async getMonthlyBilling(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.billingService.getMonthlyBilling(month, user);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Auto-generate / recalculate itemized bills for all members for a month' })
  async generateMonthlyBills(
    @Body('month') month: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.billingService.generateMonthlyBills(month, user);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record cash or UPI payment receipt against a member bill' })
  async recordPayment(
    @Param('id') billingCycleId: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.billingService.recordPayment(billingCycleId, dto, user);
  }

  @Post(':id/adjustment')
  @ApiOperation({ summary: 'Record an immutable adjustment entry with required audit note' })
  async recordAdjustment(
    @Param('id') billingCycleId: string,
    @Body() dto: RecordAdjustmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.billingService.recordAdjustment(billingCycleId, dto, user);
  }
}
