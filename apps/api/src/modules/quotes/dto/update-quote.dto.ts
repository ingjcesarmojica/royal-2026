import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateQuoteDto, QuoteItemDto } from './create-quote.dto';
import { IsArray, IsOptional, ValidateNested, IsUUID, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuoteItemDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 45000000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;
}

export class UpdateQuoteDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ type: [UpdateQuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuoteItemDto)
  @IsOptional()
  items?: UpdateQuoteItemDto[];

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
