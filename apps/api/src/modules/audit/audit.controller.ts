import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.findAll({ entity, userId });
  }
}
