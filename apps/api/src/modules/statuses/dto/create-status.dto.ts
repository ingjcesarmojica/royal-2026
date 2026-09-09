import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatusDto {
  @ApiProperty({ example: 'En negociación' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '#f59e0b', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
