import { IsString, IsEmail, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerSource } from '../entities/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ example: 'juan@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+573001234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Calle 123, Bogota', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: CustomerSource, default: CustomerSource.MANUAL })
  @IsEnum(CustomerSource)
  @IsOptional()
  source?: CustomerSource;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ example: 'Interesado en producto premium', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
