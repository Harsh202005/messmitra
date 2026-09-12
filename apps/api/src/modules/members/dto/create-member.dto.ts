import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, PlanType, MemberStatus } from '@messmitra/types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Rahul Deshmukh', description: 'Full name of the member' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+91 98901 23456', description: 'Mobile / WhatsApp phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsEnum(['male', 'female', 'other'])
  gender: Gender;

  @ApiProperty({ example: 3200, description: 'Agreed monthly subscription rate (INR)' })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ enum: ['lunch', 'dinner', 'both'], example: 'both' })
  @IsEnum(['lunch', 'dinner', 'both'])
  planType: PlanType;

  @ApiProperty({ example: '2026-09-01', description: 'Join date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  joinDate: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: MemberStatus;
}
