import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeaveStatus } from '@messmitra/types';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, ReviewLeaveDto } from './dto/create-leave.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leaves')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  @ApiOperation({ summary: 'List all leave requests with optional status filter' })
  @ApiQuery({ name: 'status', required: false, enum: ['auto_valid', 'pending_approval', 'approved', 'rejected'] })
  async getLeaves(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: LeaveStatus,
  ) {
    return this.leavesService.getLeaves(user, status);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new leave request (auto_valid or pending_approval)' })
  async submitLeave(
    @Body() dto: CreateLeaveDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leavesService.submitLeave(dto, user);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Owner one-tap approve or reject a pending leave request' })
  async reviewLeave(
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leavesService.reviewLeave(id, dto, user);
  }
}
