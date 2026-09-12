import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

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

  @ApiProperty({ example: 'balajimess@okhdfcbank', description: 'Owner UPI ID for click-to-pay reminders' })
  @IsString()
  @IsNotEmpty()
  upiId: string;

  @ApiProperty({ example: 3200, description: 'Default monthly rate for male members (INR)' })
  @IsNumber()
  @Min(0)
  defaultMaleRate: number;

  @ApiProperty({ example: 2800, description: 'Default monthly rate for female members (INR)' })
  @IsNumber()
  @Min(0)
  defaultFemaleRate: number;
}
