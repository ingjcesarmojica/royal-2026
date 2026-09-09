import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'statusId', required: false })
  @ApiQuery({ name: 'ownerId', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('statusId') statusId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.customersService.findAll({ search, statusId, ownerId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  async getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update customer status' })
  async updateStatus(@Param('id') id: string, @Body('statusId') statusId: string) {
    return this.customersService.updateStatus(id, statusId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  async remove(@Param('id') id: string) {
    await this.customersService.remove(id);
    return { message: 'Customer deleted' };
  }
}
