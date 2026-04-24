import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'KG' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Kilogram' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 'Kilogram' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Kilogram' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;
}
