import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'XR-8' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'XR-8' })
  @IsString()
  model: string;

  @ApiPropertyOptional({ example: 'Ruleta electrónica de alto rendimiento con 8 posiciones' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ProductCategory, default: ProductCategory.RULETA })
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  positions?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @IsOptional()
  diameterCm?: number;

  @ApiProperty({ example: 25000000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'https://royalxr.com/images/xr8.webp' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: { certificacion: 'GLI', material: 'Europeo' } })
  @IsOptional()
  features?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
