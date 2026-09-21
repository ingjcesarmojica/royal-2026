import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService, DashboardRange } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'range', required: false, enum: ['today', '7d', '30d', 'previous_month', 'all'] })
  async getStats(
    @Req() req: any,
    @Query('range') range?: DashboardRange,
  ) {
    return this.dashboardService.getStats(req.user.id, req.user.role, range);
  }
}
