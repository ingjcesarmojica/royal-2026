import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
