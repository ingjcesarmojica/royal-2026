import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './templates/entities/message-template.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TemplatesService } from './templates/templates.service';
import { TemplatesController } from './templates/templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageTemplate])],
  controllers: [MessagesController, TemplatesController],
  providers: [MessagesService, TemplatesService],
  exports: [MessagesService],
})
export class MessagesModule {}
