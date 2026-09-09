import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
