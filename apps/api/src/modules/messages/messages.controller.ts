import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus } from './entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  async create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get messages by customer' })
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.messagesService.findByCustomer(customerId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update message status' })
  async updateStatus(@Param('id') id: string, @Body('status') status: MessageStatus) {
    return this.messagesService.updateStatus(id, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get message statistics' })
  async getStats() {
    return this.messagesService.getStats();
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread incoming messages' })
  async getUnreadCount() {
    return this.messagesService.getUnreadCount();
  }
}
