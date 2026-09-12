import { Controller, Post, Body, Get, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, AuthUser } from '@messmitra/types';

@ApiTags('Auth (Role-Based Access Control)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with ID/Password and receive RBAC session token' })
  @ApiResponse({ status: 200, description: 'Login successful with role and token' })
  @ApiResponse({ status: 401, description: 'Invalid ID or Password' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile & permissions' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  async getProfile(@Headers('authorization') authHeader?: string): Promise<AuthUser> {
    const token = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
    return this.authService.validateToken(token);
  }

  @Get('demo-accounts')
  @ApiOperation({ summary: 'Get pre-configured test demo personas with credentials' })
  getDemoAccounts() {
    return [
      {
        role: 'owner',
        title: 'मेस चालक (Mess Owner / Admin)',
        email: 'owner@balajimess.com',
        password: 'password123',
        description: 'Full admin access: Mess rules, member management, leaves approval, 56-meal billing, expenses, and P&L ledger.',
      },
      {
        role: 'member',
        title: 'मेस सभासद (Member / Rahul Deshmukh)',
        email: 'rahul@messmitra.com',
        password: 'password123',
        description: 'Restricted member portal: View personal dues, 1-tap UPI payment, submit date-range leaves.',
      },
      {
        role: 'staff',
        title: 'आचारी महाराज (Head Cook / Kitchen Staff)',
        email: 'cook@balajimess.com',
        password: 'password123',
        description: 'Kitchen headcount display: Lunch heads, Dinner heads, member counts, leaves without financial access.',
      },
    ];
  }
}
