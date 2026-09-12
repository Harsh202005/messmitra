import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email for authentication (e.g. owner@balajimess.com, rahul@messmitra.com, cook@balajimess.com)',
    example: 'owner@balajimess.com',
  })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail!: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
