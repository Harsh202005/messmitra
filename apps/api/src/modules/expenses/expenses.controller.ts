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
import { ExpensesService } from './expenses.service';
import {
  CreateRecurringExpenseDto,
  CreateOneOffExpenseDto,
  CreateStaffDto,
} from './dto/create-expense.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses & Staff')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('recurring')
  @ApiOperation({ summary: 'List all recurring scheduled expenses (Salaries, Rent, Gas)' })
  async getRecurringExpenses(@CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.getRecurringExpenses(user);
  }

  @Post('recurring')
  @ApiOperation({ summary: 'Create a new recurring monthly expense' })
  async createRecurringExpense(
    @Body() dto: CreateRecurringExpenseDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.expensesService.createRecurringExpense(dto, user);
  }

  @Post('recurring/:id/confirm')
  @ApiOperation({ summary: 'Confirm recurring expense for the current monthly cycle' })
  async confirmRecurringCycle(
    @Param('id') id: string,
    @Body('month') month: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.expensesService.confirmRecurringCycle(id, month, user);
  }

  @Get('oneoff')
  @ApiOperation({ summary: 'List daily one-off market/maintenance expenses' })
  @ApiQuery({ name: 'month', required: false, example: '2026-09' })
  async getOneOffExpenses(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string
  ) {
    return this.expensesService.getOneOffExpenses(user, month);
  }

  @Post('oneoff')
  @ApiOperation({ summary: 'Record a new daily one-off expense with immutable audit log' })
  async createOneOffExpense(
    @Body() dto: CreateOneOffExpenseDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.expensesService.createOneOffExpense(dto, user);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List lightweight staff for tagging salary expenses' })
  async getStaff(@CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.getStaff(user);
  }

  @Post('staff')
  @ApiOperation({ summary: 'Add staff member to tag salaries' })
  async createStaff(
    @Body() dto: CreateStaffDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.expensesService.createStaff(dto, user);
  }
}
