import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateChannel } from '../entities/message-template.entity';

export class CreateTemplateDto {
  @ApiProperty({ enum: TemplateChannel })
  @IsEnum(TemplateChannel)
  channel: TemplateChannel;

  @ApiProperty({ example: 'Bienvenida' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Asunto del email', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Hola {{nombre}}, bienvenido...' })
  @IsString()
  body: string;

  @ApiProperty({ example: ['nombre', 'empresa'], required: false })
  @IsArray()
  @IsOptional()
  variables?: string[];
}
