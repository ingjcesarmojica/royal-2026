import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatusesService } from './statuses.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statuses')
export class StatusesController {
  constructor(private statusesService: StatusesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new status' })
  async create(@Body() dto: CreateStatusDto) {
    return this.statusesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all statuses' })
  async findAll() {
    return this.statusesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get status by ID' })
  async findOne(@Param('id') id: number) {
    return this.statusesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update status' })
  async update(@Param('id') id: number, @Body() dto: UpdateStatusDto) {
    return this.statusesService.update(id, dto);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder statuses' })
  async reorder(@Body() statuses: { id: number; order: number }[]) {
    return this.statusesService.reorder(statuses);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete status' })
  async remove(@Param('id') id: number) {
    await this.statusesService.remove(id);
    return { message: 'Status deleted' };
  }
}
