import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class SetupMessDto {
  @ApiProperty({ example: 'Balaji Executive Dining & Mess', description: 'Name of the Mess/Tiffin Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Karve Nagar / Kothrud', description: 'Area / Neighborhood' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({ example: 'Pune', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '09:00', description: 'Daily leave submission cutoff time in 24h format (HH:mm)' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'dailyCutoffTime must be in HH:mm format (e.g. 09:00)',
  })
  dailyCutoffTime: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Lunch leave cutoff time in 24h format (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'lunchCutoffTime must be in HH:mm format (e.g. 09:00)',
  })
  lunchCutoffTime?: string;

  @ApiPropertyOptional({ example: '18:00', description: 'Dinner leave cutoff time in 24h format (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'dinnerCutoffTime must be in HH:mm format (e.g. 18:00)',
  })
  dinnerCutoffTime?: string;

  @ApiProperty({ example: 'balajimess@okhdfcbank', description: 'Owner UPI ID for click-to-pay reminders' })
  @IsString()
  @IsNotEmpty()
  upiId: string;

  @ApiProperty({ example: 3000, description: 'Default monthly rate for pure veg (INR)' })
  @IsNumber()
  @Min(0)
  defaultVegRate: number;

  @ApiProperty({ example: 3200, description: 'Default monthly rate for non-veg / special (INR)' })
  @IsNumber()
  @Min(0)
  defaultNonVegRate: number;

  @ApiPropertyOptional({ example: 3200, description: 'Legacy fallback for male rate (INR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultMaleRate?: number;

  @ApiPropertyOptional({ example: 3000, description: 'Legacy fallback for female rate (INR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultFemaleRate?: number;

  @ApiPropertyOptional({ example: '+91 98223 38975', description: 'Owner contact phone number' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional({ example: 'Ganesh Balaji Patil', description: 'Owner display name' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा', description: 'Mess tagline/motto' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ example: 21, description: 'Number of years the mess has been established' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  establishedYears?: number;
}
