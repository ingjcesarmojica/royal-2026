import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Interactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interactions')
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interaction' })
  async create(@Body() dto: CreateInteractionDto) {
    return this.interactionsService.create(dto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get interactions by customer' })
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.interactionsService.findByCustomer(customerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete interaction' })
  async remove(@Param('id') id: string) {
    await this.interactionsService.remove(id);
    return { message: 'Interaction deleted' };
  }
}
