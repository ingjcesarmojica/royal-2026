import { IsString, IsEnum, IsUUID, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '../entities/interaction.entity';

export class CreateInteractionDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: InteractionType })
  @IsEnum(InteractionType)
  type: InteractionType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, description: 'Fecha/hora programada para visitas, alarmas y recordatorios' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ required: false, description: 'Fecha/hora para enviar recordatorio' })
  @IsDateString()
  @IsOptional()
  reminderAt?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
