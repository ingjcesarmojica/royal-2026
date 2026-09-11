import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  async create(@Body() dto: CreateQuoteDto, @Request() req: any) {
    return this.quotesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.quotesService.findAll({ customerId, status, userId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get quote statistics' })
  async getStats() {
    return this.quotesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  async findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quote' })
  async update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  async remove(@Param('id') id: string) {
    await this.quotesService.remove(id);
    return { message: 'Quote deleted' };
  }
}
