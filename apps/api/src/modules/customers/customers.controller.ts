import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  async create(@Body() dto: CreateCustomerDto, @Req() req: any) {
    if (req.user.role === 'vendedor' && !dto.ownerId) {
      dto.ownerId = req.user.id;
    }
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get customers' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'statusId', required: false })
  @ApiQuery({ name: 'ownerId', required: false })
  async findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('statusId') statusId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    if (req.user.role === 'vendedor') {
      return this.customersService.findAll({ search, statusId, ownerId: req.user.id });
    }
    return this.customersService.findAll({ search, statusId, ownerId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  async getStats(@Req() req: any) {
    if (req.user.role === 'vendedor') {
      return this.customersService.getStats(req.user.id);
    }
    return this.customersService.getStats();
  }

  @Get('by-owner')
  @ApiOperation({ summary: 'Get customer count grouped by owner (admin only)' })
  async getByOwner() {
    return this.customersService.getStatsByOwner();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const customer = await this.customersService.findOne(id);
    if (req.user.role === 'vendedor' && customer.ownerId !== req.user.id) {
      return { error: 'Access denied' };
    }
    return customer;
  }

  @Put('bulk-assign')
  @ApiOperation({ summary: 'Bulk reassign customers from one owner to another' })
  async bulkAssign(@Body() dto: BulkAssignDto) {
    return this.customersService.bulkReassign(dto.fromOwnerId ?? null, dto.toOwnerId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Req() req: any) {
    if (req.user.role === 'vendedor') {
      const customer = await this.customersService.findOne(id);
      if (customer.ownerId !== req.user.id) {
        return { error: 'Access denied' };
      }
      delete dto.ownerId;
    }
    return this.customersService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update customer status' })
  async updateStatus(@Param('id') id: string, @Body('statusId') statusId: string, @Req() req: any) {
    if (req.user.role === 'vendedor') {
      const customer = await this.customersService.findOne(id);
      if (customer.ownerId !== req.user.id) {
        return { error: 'Access denied' };
      }
    }
    return this.customersService.updateStatus(id, statusId);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign customer to owner (admin only)' })
  async assign(@Param('id') id: string, @Body('ownerId') ownerId: string) {
    return this.customersService.assignOwner(id, ownerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  async remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.role === 'vendedor') {
      const customer = await this.customersService.findOne(id);
      if (customer.ownerId !== req.user.id) {
        return { error: 'Access denied' };
      }
    }
    await this.customersService.remove(id);
    return { message: 'Customer deleted' };
  }
}
