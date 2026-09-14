import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigService } from './config.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('admin')
@Controller('config')
export class ConfigController {
  constructor(private configService: AppConfigService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get company settings (admin only)' })
  async getSettings() {
    return this.configService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update company settings (admin only)' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.configService.updateSettings(dto);
  }
}
