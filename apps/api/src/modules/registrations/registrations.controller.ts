import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Registrations & Approvals')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'List pending self-registrations for owner review' })
  @ApiQuery({ name: 'status', required: false })
  async getRegistrations(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: any
  ) {
    return this.registrationsService.getRegistrations(user, status);
  }

  @Post()
  @ApiOperation({ summary: 'Submit self-registration for new member or chef (Public)' })
  async submitRegistration(@Body() dto: any) {
    return this.registrationsService.submitRegistration(dto);
  }

  @Patch(':id/review')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Approve or reject a pending registration' })
  async reviewRegistration(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.registrationsService.reviewRegistration(id, status, user);
  }
}
