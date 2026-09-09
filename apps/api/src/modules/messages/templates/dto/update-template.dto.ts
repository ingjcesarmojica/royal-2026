import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  variables?: string[];
}
