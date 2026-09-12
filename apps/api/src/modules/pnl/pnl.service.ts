import { Injectable } from '@nestjs/common';
import {
  ProfitAndLossSummary,
  ExpenseCategory,
  generateBillingCsv,
  generateExpensesCsv,
} from '@messmitra/types';
import { BillingService } from '../billing/billing.service';
import { ExpensesService } from '../expenses/expenses.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class PnLService {
  constructor(
    private billingService: BillingService,
    private expensesService: ExpensesService
  ) {}

  async getPnLSummary(
    month: string = new Date().toISOString().substring(0, 7),
    user: AuthenticatedUser
  ): Promise<ProfitAndLossSummary> {
    const [billingData, recurringExpenses, oneOffExpenses] = await Promise.all([
      this.billingService.getMonthlyBilling(month, user),
      this.expensesService.getRecurringExpenses(user),
      this.expensesService.getOneOffExpenses(user, month),
    ]);

    const totalDuesCollected = billingData.totalAmountPaid;
    const totalPendingDues = billingData.totalPendingDues;

    // Active recurring expenses for the month
    const totalRecurringExpenses = recurringExpenses
      .filter((r) => r.isActive)
      .reduce((acc, r) => acc + r.amount, 0);

    // One-off expenses
    const totalOneOffExpenses = oneOffExpenses.reduce((acc, o) => acc + o.amount, 0);

    const totalExpenses = totalRecurringExpenses + totalOneOffExpenses;
    const netProfit = totalDuesCollected - totalExpenses;

    // Expense breakdown by category
    const expenseBreakdownByCategory: Record<ExpenseCategory, number> = {
      salary: 0,
      rent: 0,
      gas: 0,
      groceries: 0,
      dairy: 0,
      vegetables: 0,
      maintenance: 0,
      other: 0,
    };

    recurringExpenses.filter((r) => r.isActive).forEach((r) => {
      expenseBreakdownByCategory[r.category] = (expenseBreakdownByCategory[r.category] || 0) + r.amount;
    });

    oneOffExpenses.forEach((o) => {
      expenseBreakdownByCategory[o.category] = (expenseBreakdownByCategory[o.category] || 0) + o.amount;
    });

    return {
      month,
      totalDuesCollected,
      totalPendingDues,
      totalRecurringExpenses,
      totalOneOffExpenses,
      totalExpenses,
      netProfit,
      expenseBreakdownByCategory,
    };
  }

  async getBillingCsv(month: string, user: AuthenticatedUser): Promise<string> {
    const billingData = await this.billingService.getMonthlyBilling(month, user);
    return generateBillingCsv(billingData.cycles);
  }

  async getExpensesCsv(month: string, user: AuthenticatedUser): Promise<string> {
    const [recurring, oneOff] = await Promise.all([
      this.expensesService.getRecurringExpenses(user),
      this.expensesService.getOneOffExpenses(user, month),
    ]);
    return generateExpensesCsv(recurring, oneOff);
  }
}
