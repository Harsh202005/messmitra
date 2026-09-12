import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessService } from './mess.service';
import { SetupMessDto } from './dto/setup-mess.dto';
import { UpdateMessDto } from './dto/update-mess.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Mess (Tenant)')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('mess')
export class MessController {
  constructor(private readonly messService: MessService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user mess settings and profile' })
  @ApiResponse({ status: 200, description: 'Current mess details' })
  async getCurrentMess(@CurrentUser() user: AuthenticatedUser) {
    return this.messService.getMessDetails(user);
  }

  @Post('setup')
  @ApiOperation({ summary: 'Complete onboarding wizard to setup a new mess' })
  @ApiResponse({ status: 201, description: 'Mess successfully created/configured' })
  async setupMess(@Body() dto: SetupMessDto, @CurrentUser() user: AuthenticatedUser) {
    return this.messService.setupMess(dto, user);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update mess settings (rates, cutoff time, UPI ID)' })
  @ApiResponse({ status: 200, description: 'Mess successfully updated' })
  async updateMess(@Body() dto: UpdateMessDto, @CurrentUser() user: AuthenticatedUser) {
    return this.messService.updateMess(dto, user);
  }
}
