import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@messmitra/types';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordPaymentDto {
  @ApiProperty({ example: 3200, description: 'Amount paid in INR' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: ['upi_link', 'cash'], example: 'upi_link' })
  @IsEnum(['upi_link', 'cash'])
  method: PaymentMethod;

  @ApiPropertyOptional({ example: 'UPI/123456789012', description: 'UPI Transaction Reference number' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class RecordAdjustmentDto {
  @ApiProperty({ example: -200, description: 'Adjustment amount (+ or - INR)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Compensating for 2 days unserved food', description: 'Mandatory reason for adjustment' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
