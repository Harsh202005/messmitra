import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Meal Tokens')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiOperation({ summary: 'List all issued and redeemed meal tokens' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getTokens(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: any,
    @Query('search') search?: string
  ) {
    return this.tokensService.getTokens(user, status, search);
  }

  @Post()
  @ApiOperation({ summary: 'Issue a new meal token or token bundle pass' })
  async issueToken(
    @Body() dto: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tokensService.issueToken(dto, user);
  }

  @Patch(':id/redeem')
  @ApiOperation({ summary: 'Redeem meal token at kitchen counter' })
  async redeemToken(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tokensService.redeemToken(id, user);
  }
}
