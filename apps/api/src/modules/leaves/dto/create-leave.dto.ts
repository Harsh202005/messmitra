import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty({ example: 'm1111111-1111-1111-1111-111111111111', description: 'Member ID' })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ example: '2026-09-15', description: 'Start date of leave (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-09-18', description: 'End date of leave (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 'Going home for Ganpati festival', description: 'Reason for leave' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewLeaveDto {
  @ApiProperty({ enum: ['approved', 'rejected'], example: 'approved' })
  @IsString()
  @IsNotEmpty()
  status: 'approved' | 'rejected';
}
