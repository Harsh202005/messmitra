import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Price Plans')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all mess price plans and concession bundles' })
  async getPlans(@CurrentUser() user: AuthenticatedUser) {
    return this.plansService.getPlans(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update price plan' })
  async savePlan(
    @Body() plan: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.plansService.savePlan(plan, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete price plan' })
  async deletePlan(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.plansService.deletePlan(id, user);
  }
}
