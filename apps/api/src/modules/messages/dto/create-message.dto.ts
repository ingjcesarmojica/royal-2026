import { IsUUID, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageChannel, MessageDirection } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: MessageChannel })
  @IsEnum(MessageChannel)
  channel: MessageChannel;

  @ApiProperty({ enum: MessageDirection })
  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  templateId?: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;
}
