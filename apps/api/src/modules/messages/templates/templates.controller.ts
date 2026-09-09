import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateChannel } from './entities/message-template.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  async create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiQuery({ name: 'channel', required: false })
  async findAll(@Query('channel') channel?: string) {
    return this.templatesService.findAll(channel as TemplateChannel);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id') id: number) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  async update(@Param('id') id: number, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  async remove(@Param('id') id: number) {
    await this.templatesService.remove(id);
    return { message: 'Template deleted' };
  }
}
