import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuoteStatus } from '../entities/quote.entity';

export class QuoteItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 45000000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;
}

export class CreateQuoteDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'Cotización ruletas casino XYZ' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '60 días' })
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiPropertyOptional({ example: 'Precio incluye instalación' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  headerConfig?: {
    companyName?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    nit?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  bannerConfig?: {
    enabled?: boolean;
    imageUrl?: string;
    text?: string;
    backgroundColor?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  footerConfig?: {
    logoUrl?: string;
    text?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };
}
