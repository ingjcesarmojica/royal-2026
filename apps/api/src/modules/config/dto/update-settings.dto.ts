import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ example: 'Mi Empresa', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  whatsappConfig?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  emailConfig?: Record<string, any>;

  @ApiProperty({ example: 'America/Bogota', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}
