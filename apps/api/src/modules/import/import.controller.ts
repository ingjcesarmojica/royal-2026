import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import')
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Import customers from CSV data' })
  async importCSV(
    @Req() req: any,
    @Body() body: {
      fileName: string;
      data: any[];
      columnMapping: Record<string, string>;
    },
  ) {
    return this.importService.processCSV(
      req.user.id,
      body.fileName,
      body.data,
      body.columnMapping,
    );
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all import jobs' })
  async findAll() {
    return this.importService.findAll();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get import job by ID' })
  async findOne(@Param('id') id: string) {
    return this.importService.findOne(id);
  }
}
