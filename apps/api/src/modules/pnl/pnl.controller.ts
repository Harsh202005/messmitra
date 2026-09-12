import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PnLService } from './pnl.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('P&L Dashboard & Reports')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class PnLController {
  constructor(private readonly pnlService: PnLService) {}

  @Get('pnl/summary')
  @ApiOperation({ summary: 'Get monthly P&L summary (Income - Expenses = Net Profit)' })
  @ApiQuery({ name: 'month', required: false, example: '2026-09' })
  async getPnLSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string
  ) {
    return this.pnlService.getPnLSummary(month, user);
  }

  @Get('reports/billing/csv')
  @ApiOperation({ summary: 'Export monthly billing ledger as CSV' })
  @ApiQuery({ name: 'month', required: false, example: '2026-09' })
  async exportBillingCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month: string = new Date().toISOString().substring(0, 7),
    @Res() res: Response
  ) {
    const csv = await this.pnlService.getBillingCsv(month, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=billing-${month}.csv`);
    return res.send(csv);
  }

  @Get('reports/expenses/csv')
  @ApiOperation({ summary: 'Export monthly expenses as CSV' })
  @ApiQuery({ name: 'month', required: false, example: '2026-09' })
  async exportExpensesCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month: string = new Date().toISOString().substring(0, 7),
    @Res() res: Response
  ) {
    const csv = await this.pnlService.getExpensesCsv(month, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${month}.csv`);
    return res.send(csv);
  }
}
