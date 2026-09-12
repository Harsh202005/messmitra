import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemberStatus } from '@messmitra/types';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List all members in the current mess with optional filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: MemberStatus,
    @Query('search') search?: string,
  ) {
    return this.membersService.getMembers(user, status, search);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get forward-looking daily cooking forecast (active vs leaves)' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'YYYY-MM-DD' })
  async getCookForecast(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    return this.membersService.getCookForecast(user, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single member details' })
  async getMemberById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.getMemberById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new member to the mess' })
  @ApiResponse({ status: 201, description: 'Member successfully created' })
  async createMember(
    @Body() dto: CreateMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.createMember(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update member details' })
  async updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.updateMember(id, dto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle member active / inactive status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('status') status: MemberStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.toggleMemberStatus(id, status, user);
  }
}
