import {
  IsArray, IsEnum, IsInt, IsNumber, IsOptional,
  IsString, IsUUID, Length, MaxLength, Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../../common/enums';

export class CreateProductDto {
  @ApiPropertyOptional({ example: 'PRD-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  productCode?: string;

  @ApiProperty({ example: 'Tôm sú đông lạnh' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Frozen Black Tiger Shrimp' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ example: 'Tôm sú đông lạnh nguyên con, size 16/20' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ example: 'uuid-category' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'uuid-unit' })
  @IsUUID()
  baseUnitId: string;

  @ApiPropertyOptional({ example: '0306.17.00' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsCode?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netWeight?: number;

  @ApiPropertyOptional({ example: 1.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossWeight?: number;

  @ApiPropertyOptional({ example: 0.006 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionL?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionW?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionH?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pcsPerCarton?: number;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPurchasePriceVnd?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) => value?.toUpperCase())
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 6.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultSalePrice?: number;

  @ApiPropertyOptional({ example: 'uuid-vendor' })
  @IsOptional()
  @IsUUID()
  defaultVendorId?: string;

  @ApiPropertyOptional({ example: ['đông lạnh', 'xuất khẩu'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Tôm sú đông lạnh' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Frozen Black Tiger Shrimp' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  baseUnitId?: string;

  @ApiPropertyOptional({ example: '0306.17.00' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  netWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionL?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionW?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensionH?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pcsPerCarton?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPurchasePriceVnd?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) => value?.toUpperCase())
  defaultCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultSalePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defaultVendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'tôm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
