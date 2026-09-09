import { IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
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
}
