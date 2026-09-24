import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('POS & Orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of walk-in POS orders' })
  @ApiQuery({ name: 'date', required: false, example: '2026-09-17' })
  async getOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string
  ) {
    return this.ordersService.getOrders(user, date);
  }

  @Post()
  @ApiOperation({ summary: 'Create new POS walk-in order' })
  async createOrder(
    @Body() dto: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.createOrder(dto, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get daily POS counter analytics & breakdown' })
  @ApiQuery({ name: 'date', required: false, example: '2026-09-17' })
  async getDailyStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string
  ) {
    return this.ordersService.getDailyStats(user, date);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get menu catalog items for POS' })
  async getCatalog(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getCatalog(user);
  }

  @Post('catalog')
  @ApiOperation({ summary: 'Create or update POS menu catalog item' })
  async saveCatalogItem(
    @Body() item: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.saveCatalogItem(item, user);
  }
}
