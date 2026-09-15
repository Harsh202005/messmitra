import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory, RecurringFrequency } from '@messmitra/types';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRecurringExpenseDto {
  @ApiProperty({ enum: ['salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'], example: 'rent' })
  @IsEnum(['salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'])
  category: ExpenseCategory;

  @ApiProperty({ example: 'Landlord (Mr. Kulkarni)', description: 'Payee name or vendor' })
  @IsString()
  @IsNotEmpty()
  payeeName: string;

  @ApiProperty({ example: 25000, description: 'Monthly recurring amount (INR)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '2026-09-05', description: 'Next due date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  nextDueDate: string;
}

export class CreateOneOffExpenseDto {
  @ApiProperty({ enum: ['salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'], example: 'vegetables' })
  @IsEnum(['salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'])
  category: ExpenseCategory;

  @ApiProperty({ example: 1450, description: 'Amount spent in INR' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '2026-09-11', description: 'Date of expense (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ example: 'Weekly vegetable market purchase (मंडी)', description: 'Optional audit note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'Mahadev Mama', description: 'Staff full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Head Cook (महाराज)', description: 'Role or designation' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 18000, description: 'Monthly fixed salary in INR' })
  @IsNumber()
  @Min(0)
  monthlySalary: number;

  @ApiPropertyOptional({ example: '+91 97654 32101', description: 'Contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;
}
